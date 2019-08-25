from flask import Flask, render_template, request, json
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


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/test')
def index():
    return render_template('index.html')


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
