from functools import wraps

from flask import url_for, session, redirect, request, render_template, Blueprint
from flask_socketio import SocketIO

from app import redis_db
from app.db_utils import insert_user_into_db, password_valid, UniqueUserDataError, update_user_in_game, \
    get_co_players, check_validity_of_chosen_players, get_players_that_need_to_choose_game, get_players_choices, \
    create_redis_entry_for_current_round, save_game_type
from app.game_utils import deal_new_round
from app.models import User

bp = Blueprint('routes', __name__)
socketio = SocketIO()


def login_required(f):
    """determines page requires logged in user"""
    @wraps(f)
    def login_required_wrap(*args, **kwargs):
        """redirects to login page if user not currently logged in"""
        if session['logged_in']:
            return f(*args, **kwargs)
        else:
            return redirect(url_for('routes.login'))
    return login_required_wrap


@bp.route('/', methods=['GET', 'POST'])
def login():
    """handler for user log in. Checks data in form against entry in users table in db"""
    error = None

    if request.method == 'POST':
        username = request.form['username']
        user_in_db = User.query.filter_by(username=username).first()

        if user_in_db and password_valid(user_in_db.password, request.form['password']):
            session['user_id'] = user_in_db.id
            session['logged_in'] = True
            return redirect(url_for('routes.new_game'))
        else:
            error = 'Vnešeni podatki so napačni.'

    return render_template('index.html', error=error)


@bp.route('/sign-up', methods=['GET', 'POST'])
def sign_up():
    """handler for user sign up. Verifies data in form and saves it in users table in db"""
    error = None

    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        repeat_password = request.form['password2']

        if password != repeat_password:
            error = 'Gesli se ne ujemata.'
        else:
            try:
                user = insert_user_into_db(username, email, password)
                session['user_id'] = user.id
                session['logged_in'] = True
                return redirect(url_for('routes.new_game'))
            except UniqueUserDataError as e:
                error = e.message

    return render_template('sign_up.html', error=error)


@bp.route('/logout')
def logout():
    """handler for user log out"""
    session['logged_in'] = False
    return redirect(url_for('routes.login'))


@bp.route('/new-game', methods=['GET', 'POST'])
@login_required
def new_game():
    """handler for new game page"""
    user = User.query.filter_by(id=session['user_id']).first()
    game_id = user.current_game
    error = None

    if request.method == 'POST':
        if request.form['submit-button'] == 'create-game':
            username1 = request.form['username1']
            username2 = request.form['username2']

            error = check_validity_of_chosen_players(user, username1, username2)

            if not error:
                return redirect(url_for('routes.play'))

    return render_template('new_game.html', current_game=game_id, error=error)


@bp.route('/play')
@login_required
def play():
    """handler for main page of game"""
    update_user_in_game(session['user_id'], True)
    user = User.query.filter_by(id=session['user_id']).first()
    game_id = user.current_game
    co_players = get_co_players(game_id, session['user_id'])
    all_players = list(co_players.keys()) + [user.username]

    dealt_cards = deal_new_round(all_players)
    create_redis_entry_for_current_round(game_id, dealt_cards)
    choose_order = get_players_that_need_to_choose_game(game_id)
    player_to_choose = None
    player_to_choose_opts = None
    if choose_order:
        player_to_choose = choose_order[0]
        player_to_choose_opts = redis_db.hget(f'{game_id}:round_choices', f'{player_to_choose}_options')
        player_to_choose_opts = player_to_choose_opts.decode('utf-8')

    connect_handler()
    return render_template('play.html', player=user.username, co_players=co_players, round_state=dealt_cards,
                           player_to_choose=player_to_choose, player_to_choose_opts=player_to_choose_opts,
                           game_id=game_id)


@socketio.on('connect to playroom')
def connect_handler():
    """handler for connecting user to playroom via websocket"""
    user = User.query.filter_by(id=session['user_id']).first()
    co_players_choice = get_players_choices(user.current_game)
    data_to_send = {'connected_user': user.username, 'co_players_choice': co_players_choice}
    socketio.emit('a user connected', data_to_send)


@socketio.on('disconnect')
def disconnect():
    """handler for disconnecting user from playroom via websocket"""
    user = User.query.filter_by(id=session['user_id']).first()
    socketio.emit('a user disconnected', user.username)


@socketio.on('player game options')
def update_player_choosing():
    """handler for sending information of which player can choose again and what choices
    are available to them"""
    user = User.query.filter_by(id=session['user_id']).first()
    game_id = user.current_game
    player_order = get_players_that_need_to_choose_game(game_id)
    player_to_choose_game = None
    player_options = None
    if player_order:
        player_to_choose_game = player_order[0]
        player_options = redis_db.hget(f'{game_id}:round_choices', f'{player_to_choose_game}_options')
        player_options = player_options.decode('utf-8')

    co_players_choice = get_players_choices(game_id)

    data_to_send = {'player': player_to_choose_game, 'player_options': player_options,
                    'co_players_choice': co_players_choice}

    print(f'[SENDING] player to choose: {data_to_send}')
    socketio.emit('player game options', data_to_send)


@socketio.on('user choice')
def update_user_choice(username: str, choice: str):
    """updates redis db with game choice made by user for current round"""
    print(f'[RECEIVED] user: {username} choice: {choice}')
    user = User.query.filter_by(username=username).first()
    game_id = user.current_game

    # update redis with user's choice
    if choice:
        redis_db.hset(f'{game_id}:round_choices', f'{username}_chosen', choice)
    update_player_choosing()


@socketio.on('current round')
def update_round_state(game_id: str):
    """updates redis db with the current state of the round that is being played"""
    save_game_type(int(game_id))

    game_type = redis_db.hget(f'{game_id}:current_round', 'type').decode('utf-8')
    main_player = redis_db.hget(f'{game_id}:current_round', 'main_player').decode('utf-8')
    data_to_send = {'game_type': game_type, 'main_player': main_player}
    print(f'[SENDING] current round information: {data_to_send}')
    socketio.emit('current round', data_to_send)


# TODO:
#  => user clicks on a group of talon cards
#  => user chooses three/two/one cards from their pile to exchange with talon
#  => cards are swapped (cards in user's stack are sorted)
#  => update state of cards for user in redis
#  => talon disappears
#  => card persistency: if user refreshes page, the same cards should be displayed to them
#       (currently a new deck is shuffled)
#  => fix not being able to press the button on last player confirming their already chosen option
