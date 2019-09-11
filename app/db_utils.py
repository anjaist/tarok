import hashlib

from sqlalchemy.exc import IntegrityError

from app.models import User, db


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
    except IntegrityError:
        raise UniqueUserDataError()


def encrypt_password(password: str) -> str:
    """uses sha256 algorithm to encrypt user's password to be stored in db"""
    return hashlib.sha256(password.encode()).hexdigest()


def password_valid(password_in_db: str, password_to_check: str) -> bool:
    """checks that password provided by user at login is the same as the one stored in db"""
    given_password = encrypt_password(password_to_check)
    return password_in_db == given_password
