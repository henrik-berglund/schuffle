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


def is_blank_grid(cell_value):
    blanks = ["DO", "DB", "TO", "TB", ""]
    return cell_value in blanks

@app.route('/new_move', methods=['POST'])
def new_move():
    data = request.get_json()
    grid = data['grid']
    played_letters = data['playedLetters']

    # Check if all played letters are in the same row or same column
    rows = set()
    cols = set()
    for letter in played_letters:
        rows.add(letter['y'])
        cols.add(letter['x'])

    if len(rows) > 1 and len(cols) > 1:
        return jsonify({'message': 'Invalid move. Played letters are not in the same row or column.'}), 400

    # Loop and log the played letters in either horizontal or vertical order
    if len(rows) == 1:
        # Played letters are in the same row
        played_letters.sort(key=lambda letter: letter['x'])

        x_positions = set(letter['x'] for letter in played_letters)
        y_pos = played_letters[0]['y']

        # Check if x positions have consecutive letters or if there are gaps
        max_x = max(x_positions)
        min_x = min(x_positions)

        # grid may extend word
        while max_x < 14 and not is_blank_grid(grid[y_pos][max_x+1]):
            max_x+=1

        word = ""
        for x in range(min_x, max_x + 1):
            if x in x_positions:
                matching_letter = next(filter(lambda letter: letter['x'] == x, played_letters), None)
                word += matching_letter['value']
            else:
                # There is a gap at position x, check if there is a letter in the grid to cover the gap
                if not is_blank_grid(grid[y_pos][x]):
                    word += grid[y_pos][x]
                else:
                    return jsonify({'message': 'Invalid move. There is a gap between played letters.'}), 400

        print("Horizontal word:", word)
    else:
        # Played letters are in the same column
        played_letters.sort(key=lambda letter: letter['y'])
        y_positions = set(letter['y'] for letter in played_letters)

        # Check if y positions have consecutive letters or if there are gaps
        max_y = max(y_positions)
        min_y = min(y_positions)

        for y in range(min_y, max_y + 1):
            if y not in y_positions:
                # There is a gap at position y, check if there is a letter in the grid to cover the gap
                missing_x = played_letters[0]['x']
                if is_blank_grid(grid[y][missing_x]):
                    return jsonify({'message': 'Invalid move. There is a gap between played letters.'}), 400

        print("Vertical Order:", [letter['value'] for letter in played_letters])

    # Rest of your code to handle the valid move and return the response
    # ...

    # If no error was found, return a successful response
    return jsonify({'message': 'Move successfully processed.'})




@app.route('/bs')
def bs():
    return send_from_directory(app.static_folder, 'bs.html')

if __name__ == '__main__':
    app.run(port=8000, host="0.0.0.0", debug=True)

