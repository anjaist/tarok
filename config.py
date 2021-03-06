import os


class BaseConfig:
    SECRET_KEY = os.environ['SECRET_KEY']
    SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # silence the deprecation warning
    REDIS_NUMBER = 0


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    SQLALCHEMY_ECHO = False  # set to True for debugging db
    REDIS_HOST = 'localhost'
    REDIS_PORT = 6379


class ProductionConfig(BaseConfig):
    DEBUG = False
    SQLALCHEMY_ECHO = False


config = {
    'config.DevelopmentConfig': DevelopmentConfig,
    'config.ProductionConfig': ProductionConfig
}
