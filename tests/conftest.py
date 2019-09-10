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


@pytest.fixture(scope='function', name='test_db')
def init_test_db(test_users):
    db.create_all()
    insert_user_into_db(test_users[0]['username'], test_users[0]['email'], test_users[0]['password'])
    insert_user_into_db(test_users[1]['username'], test_users[1]['email'], test_users[1]['password'])
    yield db
    db.session.remove()
    db.drop_all()
