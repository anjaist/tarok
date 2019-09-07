from flask import Flask

import config
from app.routes import bp

app = Flask(__name__, template_folder='app/templates', static_folder='app/static')
app.register_blueprint(bp)

app.secret_key = config.SECRET_KEY
app.config['DEBUG'] = config.DEBUG
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%(user)s:%(pw)s@%(host)s:%(port)s/%(db)s' % config.POSTGRES

if __name__ == '__main__':
    app.run()
