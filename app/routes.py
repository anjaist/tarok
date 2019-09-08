from functools import wraps

from flask import url_for, session, redirect, request, render_template, Blueprint

import config
from app.models import User, db

bp = Blueprint('routes', __name__)


def login_required(f):
    @wraps(f)
    def login_required_wrap(*args, **kwargs):
        if session['logged_in']:
            return f(*args, **kwargs)
        else:
            return redirect(url_for('routes.login'))
    return login_required_wrap


@bp.route('/', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        # TODO: db storage instead of hardcoded in config
        if request.form['username'] == config.USERNAME and request.form['password'] == config.PASSWORD:
            session['logged_in'] = True
            return redirect(url_for('play'))
        else:
            error = 'Vnešeni podatki so napačni.'
    return render_template('index.html', error=error)


@bp.route('/sign-up', methods=['GET', 'POST'])
def sign_up():
    error = None
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        repeat_password = request.form['password2']

        if password != repeat_password:
            error = 'Gesla se ne ujemata.'
        else:
            try:
                insert_user_into_db(username, email, password)
                session['logged_in'] = True
                return redirect(url_for('routes.play'))
            except Exception as e:
                return str(e)

    return render_template('sign-up.html', error=error)


@bp.route('/logout')
def logout():
    session['logged_in'] = False
    return redirect(url_for('routes.login'))


@bp.route('/play')
@login_required
def play():
    return render_template('play.html')


def insert_user_into_db(username, email, password):
    user = User(
        username=username,
        email=email,
        password=password  # TODO: encrypt
    )
    db.session.add(user)
    db.session.commit()
