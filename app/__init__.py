import os
import time

import redis

from config import config

REDIS_CONN_TIMEOUT = 20


def init_redis():
    """initiates redis db"""
    is_in_production = config[os.environ['APP_SETTINGS']] == 'config.ProductionConfig'

    # redis-server
    i = 0
    while True:
        try:
            if is_in_production:
                redis_db = redis.from_url(os.environ.get('REDIS_URL'))
                host = 'heroku'
            else:
                host = config[os.environ['APP_SETTINGS']].REDIS_HOST
                port = config[os.environ['APP_SETTINGS']].REDIS_PORT
                db = config[os.environ['APP_SETTINGS']].REDIS_NUMBER

                pool = redis.ConnectionPool(host=host, port=port, db=db)
                redis_db = redis.StrictRedis(connection_pool=pool)

            redis_db.set('msg:init', f'hello, {host}!')
            print(redis_db.get('msg:init'))
            break
        except Exception as e:
            print(str(e))
            print(f'Connecting to redis database...')
            time.sleep(1)
            i += 1
            if i == REDIS_CONN_TIMEOUT:
                raise TimeoutError

    return redis_db


redis_db = init_redis()
