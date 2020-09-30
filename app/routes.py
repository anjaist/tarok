from functools import wraps
from typing import Union

from flask import url_for, session, redirect, request, render_template, Blueprint
from flask_socketio import SocketIO

from app.card_pile import CardPile
from app.db_utils import insert_user_into_db, password_valid, UniqueUserDataError, update_user_in_game, \
    get_co_players, check_validity_of_chosen_players, get_players_that_need_to_choose_game, get_players_choices, \
    save_game_type, get_dealt_cards, get_cards_on_table, determine_who_clears_table, check_for_end_of_round, \
    remove_card_from_hand, update_order_of_players, add_to_score_pile, reset_redis_entries, update_score_for_user
from app.game_utils import sort_player_cards, get_possible_card_plays, count_cards_in_pile, get_called_calculation, \
    calculate_extras, calculate_final_score, POINTS_GAME_TYPE
from app.models import User
from app.redis_helpers import RedisGetter, RedisSetter

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

    dealt_cards = get_dealt_cards(game_id, all_players)
    choose_order = get_players_that_need_to_choose_game(game_id)
    player_to_choose = None
    player_to_choose_opts = None
    if choose_order:
        player_to_choose = choose_order[0]
        player_to_choose_opts = RedisGetter.round_choices(game_id, f'{player_to_choose}_options')

    called = RedisGetter.current_round(game_id, 'called')
    whose_turn = RedisGetter.current_round(game_id, 'whose_turn')
    main_player = RedisGetter.current_round(game_id, 'main_player')
    game_type = RedisGetter.current_round(game_id, 'type')
    cards_on_table = RedisGetter.current_round(game_id, 'on_table')

    connect_handler()
    return render_template('play.html', player=user.username, co_players=co_players, round_state=dealt_cards,
                           player_to_choose=player_to_choose, player_to_choose_opts=player_to_choose_opts,
                           game_id=game_id, called=called, whose_turn=whose_turn, main_player=main_player,
                           game_type=game_type, on_table=cards_on_table)


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
        player_options = RedisGetter.round_choices(game_id, f'{player_to_choose_game}_options')

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
        RedisSetter.round_choices(game_id, f'{username}_chosen', choice)
    update_player_choosing()


@socketio.on('round begins')
def update_round_state_at_beginning(game_id: str):
    """updates redis db with the state of the round at its beginning"""
    save_game_type(int(game_id))

    game_type = RedisGetter.current_round(game_id, 'type')
    main_player = RedisGetter.current_round(game_id, 'main_player')
    data_to_send = {'game_type': game_type, 'main_player': main_player}
    print(f'[SENDING] new round information: {data_to_send}')
    socketio.emit('round begins', data_to_send)


@socketio.on('update players hand')
def update_players_hand(main_player: str, game_id: str, cards_to_add: list, cards_to_remove: list):
    """the chosen cards from talon are either added to or removed from the array of cards the player is already holding.
    The cards are sorted again and returned to the JS component.

    A player's hand will always need to be updated twice, first with cards_to_add and then with cards_to_remove.
    cards_to_add correspond to cards that should be removed from 'talon' and added to the against players' pile.
    cards_to_remove correspond to cards that should be removed from the user's hand and added to the main player's pile.

    To distinguish when the updating of the player's hand is finished, swap_finished is set to True."""
    swap_finished = False
    cards_in_hand = RedisGetter.current_round(game_id, f'{main_player}_cards')
    cards_in_hand = cards_in_hand.split(',')

    if cards_to_add:
        # add chosen talon cards to main player's hand
        cards_in_hand.extend(cards_to_add)

        # add remaining talon cards to 'against' players' score pile
        original_talon = RedisGetter.current_round(game_id, 'talon_cards')
        remaining_talon = [card for card in original_talon if card not in cards_to_add]
        add_to_score_pile(game_id, 'against_players', remaining_talon)
        RedisSetter.current_round(game_id, 'talon_cards', '')

    elif cards_to_remove:
        # remove chosen cards from main player's hand
        cards_in_hand = [card for card in cards_in_hand if card not in cards_to_remove]

        # add chosen cards to main player's score pile
        add_to_score_pile(game_id, 'main_player', cards_to_remove)

        swap_finished = True

    updated_hand = sort_player_cards(cards_in_hand)

    # save player's new cards to redis
    value_for_redis = ','.join(str(card_name) for card_name in updated_hand)
    RedisSetter.current_round(game_id, f'{main_player}_cards', value_for_redis)

    data_to_send = {'updated_hand': updated_hand, 'main_player': main_player, 'swap_finished': swap_finished}
    socketio.emit('update players hand', data_to_send)


@socketio.on('get hand of player')
def get_players_hand(game_id: str, player_name: str):
    """retrieves the players hand from redis"""
    players_hand = RedisGetter.current_round(game_id, f'{player_name}_cards').split(',')
    talon_cards = RedisGetter.current_round(game_id, 'talon_cards').split(',')
    data_to_send = {'players_hand': players_hand, 'player_name': player_name, 'talon_cards': talon_cards}
    socketio.emit('get hand of player', data_to_send)


@socketio.on('round call options')
def update_round_call_options(game_id: str, call_options: list):
    """adds call options to the corresponding entry in redisdb"""
    called = ','.join(call_options)
    RedisSetter.current_round(game_id, 'called', called)

    whose_turn = RedisGetter.current_round(game_id, 'whose_turn')

    # as this triggers the first round for the first player, all cards from their hand can be played
    can_be_played = RedisGetter.current_round(game_id, f'{whose_turn}_cards')
    players_cards = can_be_played.split(',')

    data_to_send = {'called': called, 'whose_turn': whose_turn, 'can_be_played': players_cards,
                    'players_hand': players_cards}
    socketio.emit('round call options', data_to_send)


@socketio.on('gameplay for round')
def play_round(game_id: str, user_whose_card: str, card_played: Union[str, None]):
    """
    This method is called continuously by the JS side for the lifetime of a round in a game.
    It needs to be called once every time a player plays a card.

    Once all players have played their card, the round has ended and the redis data is cleared for the game_id.
    This means that the players once again need to choose their round options, see talon and call round attributes
    before this method is called again and a new round is played.

    If card_played=None, this means that the page was reloaded and the frontend side needs information
    on the current state (namely, cards that can be played) and so information should be sent
    but no data in redis should be changed.
    """
    print(f'[RECEIVED] card played by {user_whose_card}: {card_played}')

    whose_turn = RedisGetter.current_round(game_id, 'whose_turn')
    cards_on_table = get_cards_on_table(game_id)
    pile_to_add_to = None

    if card_played:
        # check that the received card is from the expected user
        assert user_whose_card == whose_turn

        # add card_played to redis for the relevant user and remove it from their hand
        RedisSetter.current_round(game_id, f'{user_whose_card}_played', card_played)
        remove_card_from_hand(game_id, user_whose_card, card_played)

        # if the card played is the third card on the table, determine who clears the table
        cards_on_table.append(card_played)
        RedisSetter.current_round(game_id, 'on_table', ','.join(cards_on_table))
        if len(cards_on_table) == 3:
            pile_to_add_to = determine_who_clears_table(game_id, cards_on_table)

            # add cleared cards to the correct user's (or user group's) pile
            main_player = RedisGetter.current_round(game_id, 'main_player')
            identifier = 'main_player' if pile_to_add_to == main_player else 'against_players'
            add_to_score_pile(game_id, identifier, cards_on_table)

            updated_whose_turn = update_order_of_players(game_id, new_first_player=pile_to_add_to)
        else:
            updated_whose_turn = update_order_of_players(game_id)
    else:
        updated_whose_turn = whose_turn

    is_round_finished = check_for_end_of_round(game_id)

    if is_round_finished:
        players_cards = []
        can_be_played = []
    else:
        players_cards = RedisGetter.current_round(game_id, f'{updated_whose_turn}_cards')
        players_cards = players_cards.split(',')
        can_be_played = get_possible_card_plays(cards_on_table, players_cards)

    data_to_send = {'is_round_finished': is_round_finished, 'whose_turn': updated_whose_turn,
                    'pile_to_add_to': pile_to_add_to, 'can_be_played': can_be_played, 'players_hand': players_cards,
                    'on_table': cards_on_table}
    socketio.emit('gameplay for round', data_to_send)


@socketio.on('calculate score')
def calculate_score(game_id: str, current_user: str):
    """calculates score based on main_user's score pile, called and game_type"""
    card_pile_main = RedisGetter.current_round(game_id, 'main_player_score_pile').split(',')
    card_pile_against = RedisGetter.current_round(game_id, 'against_players_score_pile').split(',')
    called = RedisGetter.current_round(game_id, 'called').split(',')
    game_type = RedisGetter.current_round(game_id, 'type')

    counted_cards = count_cards_in_pile(card_pile_main)
    called_calculation = get_called_calculation(card_pile_main, called)
    extras_calculation = calculate_extras(card_pile_main, card_pile_against, called)
    final_calculation = calculate_final_score(card_pile_main, card_pile_against, called, game_type)
    points_difference = CardPile.round_to_five(counted_cards) - 35

    data_to_send = {'counted_cards': counted_cards, 'called_calculation': called_calculation,
                    'extras_calculation': extras_calculation, 'final_calculation': final_calculation,
                    'game_worth': POINTS_GAME_TYPE[game_type], 'points_difference': points_difference}
    socketio.emit('calculate score', data_to_send)

    main_player = RedisGetter.current_round(game_id, 'main_player')
    if main_player == current_user:
        update_score_for_user(main_player, final_calculation)
    reset_redis_entries(game_id)


# TODO:
#  => current score state should be shown somewhere on screen - for all users
#  => back of cards should be displayed as score pile (with number of cards? or just names?)
