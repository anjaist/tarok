from app.db_utils import encrypt_password, UniqueUserDataError
from app.models import User


def test_login_page(client, test_db, test_users):
    """tests login page redirection"""
    response = client.get('/')
    assert response.status_code == 200
    test_data = test_users[0].copy()
    test_data.pop('email')
    response = client.post('/', data=test_data)
    assert response.status_code == 302
    assert response.location.endswith('/new-game')


def test_signup_page(client, test_db, test_users):
    """tests signup page redirection & new user creation in db"""
    test_data = test_users[2].copy()
    test_data['password2'] = test_data['password']
    response = client.post('/sign-up', data=test_data)
    assert response.status_code == 302
    assert response.location.endswith('/new-game')
    new_user_in_db = User.query.filter_by(username=test_users[0]['username']).first()
    assert new_user_in_db.email == test_users[0]['email']
    assert new_user_in_db.password != test_users[0]['password']
    assert new_user_in_db.password == encrypt_password(test_users[0]['password'])


def test_logout(client):
    """tests logout page redirection"""
    response = client.get('/logout')
    assert response.status_code == 302
    assert response.location.endswith('/')


def test_unique_user_violation(client, test_db, test_users):
    """tests message is displayed when user tries to sign up with a non unique username or email"""
    non_unique_user = test_users[2].copy()
    non_unique_user['username'] = test_users[0]['username']
    non_unique_user['password2'] = non_unique_user['password']

    # try to sign up with the same username as user already in db
    response = client.post('/sign-up', data=non_unique_user)
    assert response.status_code == 200
    error_msg = UniqueUserDataError().message
    assert error_msg.encode() in response.data
