import hashlib

from sqlalchemy.exc import IntegrityError

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
    update_user_with_new_game_info(game.id, [player1, player2, player3, player4])
    return game


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
