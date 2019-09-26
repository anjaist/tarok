import os

from flask import Flask
from flask_migrate import Migrate

from app.routes import bp, socketio
from app.models import db


def create_app():
    """creates flask application and returns it"""
    app = Flask(__name__, template_folder='app/templates', static_folder='app/static')
    app.register_blueprint(bp)

    app.config.from_object(os.environ['APP_SETTINGS'])

    db.init_app(app)
    socketio.init_app(app)

    return app


app = create_app()
migrate = Migrate(app, db)
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    socketio.run(app)
