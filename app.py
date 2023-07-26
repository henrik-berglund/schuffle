from flask import Flask, jsonify, send_from_directory, send_file, request
from flask_cors import CORS
import random


app = Flask(__name__, static_folder='static')
CORS(app)  # This will enable CORS for all routes

words = ["sill", "dill", "torsk", "romsås", "kräftor"]


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


@app.route('/new_game')
def get_layout():
    #return send_file('layout.json', mimetype='application/json')
    return send_file('boards/board_10_32_Player 1_a.json', mimetype='application/json')

@app.route('/new_move', methods=['POST'])
def new_move():
    data = request.get_json()

    # Extract the grid data and dragged letter tiles data from the JSON
    grid_data = data.get('grid')
    dragged_letter_tiles = data.get('draggedLetterTiles')

    # Process the data as needed...
    # For example, you can access individual items in the grid like this:
    # grid_data[row_index][column_index]

    # You can also iterate through the dragged letter tiles and access their properties:
    # for tile_data in dragged_letter_tiles:
    #     x = tile_data['x']
    #     y = tile_data['y']
    #     letter = tile_data['letter']

    # Return a response if needed
    return jsonify({"message": "Received new move data successfully!"})

@app.route('/bs')
def bs():
    return send_from_directory(app.static_folder, 'bs.html')

if __name__ == '__main__':
    app.run(port=8000, host="0.0.0.0", debug=True)

