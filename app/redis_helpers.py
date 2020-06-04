"""This module contains helper classes for getting and setting data in redis db"""
from app import redis_db


class RedisGetter:
    @staticmethod
    def current_round(game_id: int, key_name: str) -> str:
        """gets the value of key_name from the :current_round entry in redis for game_id and decodes it"""
        value = redis_db.hget(f'{game_id}:current_round', key_name)
        value = "" if not value else value.decode('utf-8')
        return value

    @staticmethod
    def round_choices(game_id: int, key_name: str) -> str:
        """gets the value of key_name from the :round_choices entry in redis for game_id and decodes it"""
        value = redis_db.hget(f'{game_id}:round_choices', key_name)
        value = "" if not value else value.decode('utf-8')
        return value


class RedisSetter:
    @staticmethod
    def current_round(game_id: int, key_name: str, value: str):
        """sets a key-value combination in the :current_round entry in redis db for game_id"""
        redis_db.hset(f'{game_id}:current_round', key_name, value)

    @staticmethod
    def round_choices(game_id: int, key_name: str, value: str):
        """sets a key-value combination in the :round_choices entry in redis db for game_id"""
        redis_db.hset(f'{game_id}:round_choices', key_name, value)
