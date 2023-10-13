from flask import Flask

app = Flask(__name__)


@app.route('/')
def hello():
    return open("../front-end/index.html", "r").read()


app.run()
