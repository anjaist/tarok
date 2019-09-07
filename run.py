from flask import Flask

import config

app = Flask(__name__)
app.secret_key = config.SECRET_KEY


if __name__ == '__main__':
    app.run(debug=True)
