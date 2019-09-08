from flask import Flask

import config
from config import POSTGRES
from app.routes import bp
from app.models import db

app = Flask(__name__, template_folder='app/templates', static_folder='app/static')
app.register_blueprint(bp)

app.secret_key = config.SECRET_KEY
app.config['DEBUG'] = config.DEBUG
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql+psycopg2://{POSTGRES["user"]}:{POSTGRES["pw"]}@' \
    f'{POSTGRES["host"]}/{POSTGRES["db"]}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # silence the deprecation warning
app.config['SQLALCHEMY_ECHO'] = True # set to True for debugging purposes

db.init_app(app)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

    app.run()
