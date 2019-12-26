import hashlib
import random

from sqlalchemy.exc import IntegrityError

from app import redis_db
from app.game_utils import POINTS_GAME_TYPE
from app.models import User, db, Game


class UniqueUserDataError(Exception):
    """custom error class to be thrown when unique restraint in db is violated"""
    def __init__(self, message='Račun s tem uporabniškim imenom ali emailom že obstaja'):
        self.message = message
        super().__init__(message)


def insert_user_into_db(username: str, email: str, password: str):
    """inserts new entry into users table in db"""
    try:
        user = User(
            username=username,
            email=email,
            password=encrypt_password(password)
        )
        db.session.add(user)
        db.session.commit()
        return user
    except IntegrityError:
        raise UniqueUserDataError()


def encrypt_password(password: str) -> str:
    """uses sha256 algorithm to encrypt user's password to be stored in db"""
    return hashlib.sha256(password.encode()).hexdigest()


def password_valid(password_in_db: str, password_to_check: str) -> bool:
    """checks that password provided by user at login is the same as the one stored in db"""
    given_password = encrypt_password(password_to_check)
    return password_in_db == given_password


def create_new_game(player1: User, player2: User, player3: User, player4=None):
    """creates new entry in game table of db"""
    player4_id = None if not player4 else player4.id

    game = Game(
        player1=player1.id,
        player2=player2.id,
        player3=player3.id,
        player4=player4_id
    )
    db.session.add(game)
    db.session.commit()

    create_redis_entry_for_round_choices(game.id, [player1, player2, player3])
    update_user_with_new_game_info(game.id, [player1, player2, player3, player4])


def create_redis_entry_for_round_choices(game_id: int, players: list):
    """creates new entry in redis db with empty game choice and assigns players a random order. Example entry:
    '12345:round_choices': {'user1': 'three', 'user2': 'pass', 'user3': 'two', 'order': [user1, user3, user2]} """
    random.shuffle(players)

    for player in players:
        redis_db.hset(f'{game_id}:round_choices', f'{player.username}_chosen', None)
        redis_db.hset(f'{game_id}:round_choices', f'{player.username}_options', 'three,two,one,pass')

        # player 1 initially shouldn't be able to choose 'pass'
        if player == players[0]:
            redis_db.hset(f'{game_id}:round_choices', f'{player.username}_options', 'three,two,one')

    redis_db.hset(f'{game_id}:round_choices', 'order', ','.join(players))


def update_user_with_new_game_info(game_id: int, users: list):
    """updates current_game, current_score and current_duplication_tokens columns for each user in users"""
    for user in users:
        if not user:
            continue
        user.current_game = game_id
        user.current_score = 0
        user.current_duplication_tokens = 0
        db.session.commit()


def update_user_in_game(user_id: int, in_game_value: bool):
    """updates in_game column for user"""
    user = User.query.filter_by(id=user_id).first()
    user.in_game = in_game_value
    db.session.commit()


def get_co_players(game_id: int, current_player_id: int) -> dict:
    """returns dictionary of all co-players in game and their active status"""
    game = Game.query.filter_by(id=game_id).first()
    players_of_game = [game.player1, game.player2, game.player3, game.player4]
    if players_of_game[-1] is None:
        players_of_game.pop()

    co_players = {}
    for player_id in players_of_game:
        player = User.query.filter_by(id=player_id).first()
        if player.id == current_player_id:
            continue
        co_players[player.username] = player.in_game

    return co_players


def check_validity_of_chosen_players(user: User, username1: str, username2: str):
    """checks that chosen co_players exist in db"""
    co_player1 = User.query.filter_by(username=username1).first()
    co_player2 = User.query.filter_by(username=username2).first()
    error = None

    if co_player1 == user or co_player2 == user:
        error = 'Ne moreš igrati sam s seboj!'

    if co_player1 and co_player2:
        for player in [co_player1, co_player2]:
            if player.current_game:
                error = f'Igralec {player.username} že ima aktivno igro.'
    else:
        if not co_player1:
            error = f'Igralec {username1} ne obstaja.'
        elif not co_player2:
            error = f'Igralec {username2} ne obstaja.'

    if not error:
        create_new_game(co_player1, co_player2, user)

    return error


def get_players_that_need_to_choose_game(game_id: int) -> list:
    """queries redis db and returns players that can still make a choice of game for round"""
    player_order = (redis_db.hget(f'{game_id}:round_choices', 'order')).decode('utf-8')
    player_order = player_order.split(',')

    # remove player from first choosing position if they've already made a choice
    choice_of_current_player = redis_db.hget(f'{game_id}:round_choices', f'{player_order[0]}_chosen')
    if choice_of_current_player:
        player_order.pop(0)

    # add player to end of choosing queue if they still have options available
    options_of_current_player = redis_db.hget(f'{game_id}:round_choices', f'{player_order[0]}_options')
    if options_of_current_player:
        player_order.append(player_order[0])

    # save new revised order in redis db
    redis_db.hset(f'{game_id}:round_choices', 'new_order', player_order)

    return player_order


def update_player_options(game_id: int):
    """updates players' options based on current state of choices in redis db"""

    # get original player order from redis
    player_order = (redis_db.hget(f'{game_id}:round_choices', 'order')).decode('utf-8')
    player_order = player_order.split(',')

    # get current choice of each player
    player1_choice = (redis_db.hget(f'{game_id}:round_choices', f'{player_order[0]}_chosen')).decode('utf-8')
    player2_choice = (redis_db.hget(f'{game_id}:round_choices', f'{player_order[1]}_chosen')).decode('utf-8')
    player3_choice = (redis_db.hget(f'{game_id}:round_choices', f'{player_order[2]}_chosen')).decode('utf-8')

    # get minimum worh of game to be upped by next player choosing
    chosen_games = [player1_choice, player2_choice, player3_choice]
    minimum_game_worth = 0
    for ch in chosen_games:
        if POINTS_GAME_TYPE[ch] > minimum_game_worth:
            minimum_game_worth = POINTS_GAME_TYPE[ch]

    # determine available games based on minimum worth of game
    minimum_available_games = []
    if minimum_game_worth == 10:
        minimum_available_games.append('two')
        minimum_available_games.append('one')
    elif minimum_game_worth == 20:
        minimum_available_games.append('one')


    # if players 2 and 3 chose a game worth more than what player 1 chose, player 1 can choose again
    if player1_choice == 'pass':
        redis_db.hset(f'{game_id}:round_choices', f'{player_order[0]}_options', None)
    else:
        player1_options = ['pass']
        if POINTS_GAME_TYPE[player1_choice] < POINTS_GAME_TYPE[player2_choice]:
            player1_options.append(player2_choice)
        if POINTS_GAME_TYPE[player1_choice] < POINTS_GAME_TYPE[player3_choice]:
            player1_options.append(player3_choice)

        if minimum_available_games:
            player1_options.extend(minimum_available_games)
            player1_options = ','.join(list(set(player1_options)))

        redis_db.hset(f'{game_id}:round_choices', f'{player_order[0]}_options', player1_options)

    # if player 3 chose a game worth more than what player 2 chose, player 2 can choose again
    if player2_choice == 'pass':
        redis_db.hset(f'{game_id}:round_choices', f'{player_order[1]}_options', None)
    else:
        player2_options = ['pass']
        if POINTS_GAME_TYPE[player2_choice] < POINTS_GAME_TYPE[player3_choice]:
            player2_options.append(player3_choice)

        if minimum_available_games:
            player2_options.extend(minimum_available_games)
            player2_options = ','.join(list(set(player2_options)))

        redis_db.hset(f'{game_id}:round_choices', f'{player_order[1]}_options', player2_options)

    # if player 3 can still choose a game worth more than what they've alreasy chosen, they can choose again
    if player3_choice == 'pass':
        redis_db.hset(f'{game_id}:round_choices', f'{player_order[2]}_options', None)
    else:
        if minimum_available_games:
            player3_options = ','.join(minimum_available_games)
            redis_db.hset(f'{game_id}:round_choices', f'{player_order[2]}_options', player3_options)
