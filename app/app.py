from flask import Flask, render_template, request, json, redirect, url_for
import pusher

import config

app = Flask(__name__)
pusher_client = pusher.Pusher(
    app_id=config.PUSHER_APP_ID,
    key=config.PUSHER_KEY,
    secret=config.PUSHER_SECRET,
    cluster=config.PUSHER_CLUSTER,
    ssl=True
)


@app.route('/', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['username'] == config.USERNAME and request.form['password'] == config.PASSWORD:
            return redirect(url_for('play'))
        else:
            error = 'Invalid credentials!'
    return render_template('index.html', error=error)


@app.route('/play')
def play():
    return render_template('play.html')


@app.route('/pusher/auth', methods=['POST'])
def pusher_auth():
    auth = pusher_client.authenticate(
        channel=request.form['channel_name'],
        socket_id=request.form['socker_id']
    )
    return json.dumps(auth)


if __name__ == '__main__':
    app.run(debug=True)
