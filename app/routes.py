from functools import wraps

from flask import url_for, session, redirect, request, render_template, Blueprint

import config

bp = Blueprint('routes', __name__)


def login_required(f):
    @wraps(f)
    def login_required_wrap(*args, **kwargs):
        if session['logged_in']:
            return f(*args, **kwargs)
        else:
            return redirect(url_for('login'))
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
    # TODO: implement check for uniqueness of username and email
    error = None
    if request.method == 'POST':
        if request.form['password'] != request.form['password2']:
            error = 'Gesla se ne ujemata.'
        else:
            session['logged_in'] = True
            return redirect(url_for('play'))
    return render_template('sign-up.html', error=error)


@bp.route('/logout')
def logout():
    session['logged_in'] = False
    return redirect(url_for('login'))


@bp.route('/play')
@login_required
def play():
    return render_template('play.html')
