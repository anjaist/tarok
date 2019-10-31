from functools import wraps

from flask import url_for, session, redirect, request, render_template, Blueprint
from flask_socketio import SocketIO, emit, join_room, leave_room

from app.db_utils import insert_user_into_db, password_valid, UniqueUserDataError, update_user_in_game, \
get_co_players, check_validity_of_chosen_players
from app.game_utils import deal_new_round
from app.models import User

bp = Blueprint('routes', __name__)
socketio = SocketIO()
thread = None


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


@bp.route('/play')
@login_required
def play():
    """handler for main page of game"""
    update_user_in_game(session['user_id'], True)
    user = User.query.filter_by(id=session['user_id']).first()
    game_id = user.current_game
    co_players = get_co_players(game_id, session['user_id'])
    all_players = list(co_players.keys()) + [user.username]

    new_round = deal_new_round(all_players)

    connect_handler()
    return render_template('play.html', player=user.username, co_players=co_players, round_state=new_round)


@socketio.on('connect to playroom')
def connect_handler():
    """handler for connecting user to playroom via websocket"""
    user = User.query.filter_by(id=session['user_id']).first()
    socketio.emit('a user connected', (user.username))


@socketio.on('disconnect')
def disconnect():
    """handler for disconnecting user from playroom via websocket"""
    user = User.query.filter_by(id=session['user_id']).first()
    socketio.emit('a user disconnected', (user.username))


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
