import pytest

from app.db_utils import insert_user_into_db
from app.models import db
from run import create_app


@pytest.fixture(scope='session', name='client')
def get_test_client():
    test_app = create_app()
    client = test_app.test_client()
    context = test_app.app_context()
    context.push()
    yield client
    context.pop()


@pytest.fixture(scope='session', name='test_users')
def create_test_users():
    return [
        {'username': 'anjabanja', 'email': 'anja@banja.si', 'password': '4nj4b4nj4'},
        {'username': 'lukalukica', 'email': 'luka@lukica.si', 'password': 'look@luka'},
        {'username': 'katjakatič', 'email': 'katja@katic.si', 'password': 'katkabrezcopatka'}
    ]


@pytest.fixture(scope='session', name='test_users_simple')
def create_simple_test_users():
    db.session.remove()
    db.drop_all()
    db.create_all()
    users = [
        {'username': 'anja', 'email': 'anja@anja.si', 'password': 'anja'},
        {'username': 'igralec', 'email': 'igra@lec.si', 'password': 'anja'},
        {'username': 'igralka', 'email': 'igra@lka.si', 'password': 'anja'}
    ]
    for user in users:
        insert_user_into_db(user['username'], user['email'], user['password'])

    yield db


@pytest.fixture(scope='function', name='test_db')
def init_test_db(test_users):
    db.create_all()
    insert_user_into_db(test_users[0]['username'], test_users[0]['email'], test_users[0]['password'])
    insert_user_into_db(test_users[1]['username'], test_users[1]['email'], test_users[1]['password'])
    yield db
    db.session.remove()
    db.drop_all()


@pytest.fixture(name='redis_end_of_round')
def get_end_of_round_redis_entries():
    def func():
        round_choices = {
            'anja_chosen': 'one',
            'anja_options': 'chosen',
            'igralka_chosen': 'pass',
            'igralka_options': 'chosen',
            'igralec_chosen': 'pass',
            'igralec_options': 'chosen',
            'order': 'igralka,anja,igralec',
            'new_order': '',
            'last_choice': 'true'
        }
        current_round = {
            'type': 'one',
            'order': 'anja,igralec,igralka',
            'main_player': 'anja',
            'whose_turn': 'anja',
            'anja_cards': '5',
            'igralec_cards': 'cc-caval-of-hearts',
            'igralka_cards': 'ee-of-diamonds',
            'talon_cards': '9,aa-king-of-clubs,17,19,cc-caval-of-spades,16',
            'called': 'trula',
            'on_table': '6,dd-jack-of-spades,ee-of-spades',
            'anja_played': '6',
            'igralec_played': 'dd-jack-of-spades',
            'igralka_played': 'ee-of-spades',
            'main_player_score_pile': 'aa-king-of-hearts,2,hh-of-hearts,aa-king-of-clubs,ff-of-clubs,'
                                      'dd-jack-of-clubs,gg-of-hearts,dd-jack-of-hearts,4,dd-jack-of-diamonds,'
                                      'aa-king-of-diamonds,bb-queen-of-diamonds,ff-of-hearts,7,11,bb-queen-of-hearts,'
                                      '20,22,14,aa-king-of-spades,8,15,hh-of-spades,10,18,ee-of-hearts,12,13,'
                                      'gg-of-spades,ff-of-spades,6,dd-jack-of-spades,ee-of-spades',
            'against_players_score_pile': 'hh-of-clubs,bb-queen-of-clubs,cc-caval-of-clubs,gg-of-clubs,ee-of-clubs,'
                                          '1,gg-of-diamonds,3,hh-of-diamonds,ff-of-diamonds,21,cc-caval-of-diamonds'
        }
        return round_choices, current_round
    yield func
