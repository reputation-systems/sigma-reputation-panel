from flask import Flask, jsonify
from extract_unexpended_reputation_proofs import extract_unexpended_reputation_proofs

app = Flask(__name__)


@app.route('/')
def hello():
    return open("../front-end/index.html", "r").read()


@app.route('/get_unexpended_reputation_proofs/<owner_pk>')
def get_unexpended_reputation_proofs(owner_pk: str):
    return jsonify([
        _e.__dict__() for _e in
        extract_unexpended_reputation_proofs(owner_pk=owner_pk.encode("utf-8"))
    ])


app.run(debug=True)
