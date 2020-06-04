import os
import logging

from flask import Flask

from app.routes import bp, socketio
from app.models import db, migrate


def create_app():
    """creates flask application and returns it"""
    app = Flask(__name__, template_folder='app/templates', static_folder='app/static')
    app.register_blueprint(bp)

    app.config.from_object(os.environ['APP_SETTINGS'])

    # setting the level of socketio logs to ERROR to reduce spammy messages in flask server output
    logger = logging.getLogger('werkzeug')
    logger.setLevel(logging.ERROR)

    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app)

    return app


app = create_app()
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    socketio.run(app)
