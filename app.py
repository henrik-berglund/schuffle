from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import random

app = Flask(__name__, static_folder='static')
CORS(app)  # This will enable CORS for all routes

words = ["sill", "dill", "torsk", "romsås", "kräftor", "sillsallad"]


@app.route('/api/word', methods=['GET'])
def get_word():
    # Select a random word from the list
    word = random.choice(words)

    # Scramble the word
    scrambled = ''.join(random.sample(word, len(word)))

    # Return the scrambled word and its solution
    return jsonify({
        'scrambled': scrambled.upper(),
        'solutions': [word.upper()],
    })


@app.route('/game')
def game():
    return send_from_directory(app.static_folder, 'game.html')


if __name__ == '__main__':
    app.run(debug=True)
