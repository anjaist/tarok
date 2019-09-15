from datetime import datetime

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class BaseModel(db.Model):
    """base db model"""
    __abstract__ = True

    def __repr__(self):
        """base way to print all models"""
        model_dict = {}
        for key, value in self._to_dict().items:
            model_dict[key] = value

        return f'{self.__class__.__name__}: {model_dict}'


    def json(self):
        """json-ifies model"""
        result = {}
        for key, value in self._to_dict().items():
            if isinstance(value, datetime.date):
                result[key] = value.strftime('%Y-%m-%d')
            else:
                result[key] = value

        return result


class Game(BaseModel):
    """model for the games table"""
    __tablename__ = 'games'

    id = db.Column(db.Integer, primary_key=True)
    player1 = db.Column(db.Integer, nullable=False)
    player2 = db.Column(db.Integer, nullable=False)
    player3 = db.Column(db.Integer, nullable=False)
    player4 = db.Column(db.Integer)
    active = db.Column(db.Boolean, default=True)
    deleted = db.Column(db.Boolean, default=False)


class User(BaseModel):
    """model for the users table"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    username = db.Column(db.String, unique=True, nullable=False)
    current_score = db.Column(db.Integer, nullable=True)
    current_duplication_tokens = db.Column(db.Integer, nullable=True)
    current_game = db.Column(db.Integer, db.ForeignKey(Game.id), nullable=True)
    deleted = db.Column(db.Boolean, default=False)
