import secrets

DEBUG = True
USERNAME = 'admin'
PASSWORD = 'admin'
SECRET_KEY = secrets.token_hex(64)

POSTGRES = {
    'user': 'anjaistenic',
    'pw': 'db-password',
    'db': 'tarok_dev',
    'host': 'localhost',
    'port': '5432'
}
