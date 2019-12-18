import os
import redis

from config import config


def init_redis():
    """initiates redis db"""
    return redis.StrictRedis(host=config[os.environ['APP_SETTINGS']].REDIS_HOST,
                             port=config[os.environ['APP_SETTINGS']].REDIS_PORT,
                             db=config[os.environ['APP_SETTINGS']].REDIS_NUMBER)


redis_db = init_redis()
