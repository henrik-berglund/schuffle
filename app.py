from flask import Flask, jsonify, send_from_directory, send_file, request
from flask_cors import CORS
import random


app = Flask(__name__, static_folder='static')
CORS(app)  # This will enable CORS for all routes


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

def flip_grid(grid):
    # Get the number of rows and columns in the grid
    rows = len(grid)
    cols = len(grid[0])

    # Create a new grid with swapped positions
    flipped_grid = [[grid[y][x] for y in range(rows)] for x in range(cols)]

    return flipped_grid

def get_crossing_words(grid, played_letters):
    words = []

    for letter in played_letters:
        x, start_y = letter['x'], letter['y']
        print(f"{x, start_y}")
        # Follow word upwards until the start is found
        while 0 < start_y and not is_blank_grid(grid[start_y-1][x]):
            start_y -= 1
            print(f"up {x, start_y}")

        # Follow word downwards until the end is found
        end_y =  letter['y']
        print(f"down {x, end_y}")
        while end_y < 14 and not is_blank_grid(grid[end_y+1][x]):
            end_y += 1
            print(f"{x, end_y}")


        word = ""
        for y in range(start_y, end_y+1):
            if y == letter['y']:
                word += letter['value']
            else:
                word += grid[y][x]
        if  len(word) > 1 :
            words.append(word)

    return words

def flip_played_letters(played_letters):
    flipped_letters = []
    for letter in played_letters:
        flipped_letter = {
            'x': letter['y'],  # Swap x and y positions
            'y': letter['x'],  # Swap x and y positions
            'value': letter['value']
        }
        flipped_letters.append(flipped_letter)
    return flipped_letters

def has_adjacent_letters(grid, played_letters):
    for letter in played_letters:
        x, y = letter['x'], letter['y']

        # Check adjacent positions: left, right, up, down
        adjacent_positions = [(x-1, y), (x+1, y), (x, y-1), (x, y+1)]
        for adj_x, adj_y in adjacent_positions:
            if 0 <= adj_x < 15 and 0 <= adj_y < 15 and not is_blank_grid(grid[adj_y][adj_x]):
                return True

    return False

@app.route('/new_move', methods=['POST'])
def new_move():
    data = request.get_json()
    grid = data['grid']
    played_letters = data['playedLetters']
    post_response = None
    formed_words = []

    # Check if all played letters are in the same row or same column
    rows = set()
    cols = set()
    for letter in played_letters:
        rows.add(letter['y'])
        cols.add(letter['x'])

    if len(rows) > 1 and len(cols) > 1:
        post_response = jsonify({'message': 'Invalid move. Played letters are not in the same row or column.'}), 400
    elif not has_adjacent_letters(grid, played_letters):
        post_response = jsonify({'message': 'Invalid move. Played letters are not adjacent to any existing letters on the grid.'}), 400
    elif len(rows) == 1: # Played letters are in the same row
        post_response, word = check_and_collect_horizontal_word(grid, played_letters, post_response)

        if not post_response:
            print("Horizontal word:", word)
            formed_words.append(word)
            crossing = get_crossing_words(grid, played_letters)
            print("Crossing words: ", crossing)
            formed_words.extend(crossing)
            print("All words: ", formed_words)

    else: # Played letters are in the same column
        grid = flip_grid(grid)
        played_letters = flip_played_letters(played_letters)
        post_response, word = check_and_collect_horizontal_word(grid, played_letters, post_response)

        print("Vertical word:", word)

    if not post_response:

        post_response = jsonify({'message': 'Move successfully processed.'})

    return post_response


def check_and_collect_horizontal_word(grid, played_letters, post_response):
    played_letters.sort(key=lambda letter: letter['x'])
    positions = set(letter['x'] for letter in played_letters)
    y_pos = played_letters[0]['y']
    # Check if x positions have consecutive letters or if there are gaps
    max_pos = max(positions)
    min_pos = min(positions)
    # Grid may extend word
    while max_pos < 14 and not is_blank_grid(grid[y_pos][max_pos + 1]):
        max_pos += 1
    # Grid may prefix played letters
    while min_pos > 0 and not is_blank_grid(grid[y_pos][min_pos - 1]):
        min_pos -= 1
    word = ""
    for pos in range(min_pos, max_pos + 1):
        if pos in positions:
            matching_letter = next(filter(lambda letter: letter['x'] == pos, played_letters), None)
            word += matching_letter['value']
        elif not is_blank_grid(grid[y_pos][
                                   pos]):  # There is a gap at position x, check if there is a letter in the grid to cover the gap
            word += grid[y_pos][pos]
        else:
            post_response = jsonify({'message': 'Invalid move. There is a gap between played letters.'}), 400
    return post_response, word


@app.route('/bs')
def bs():
    return send_from_directory(app.static_folder, 'bs.html')

if __name__ == '__main__':
    app.run(port=8000, host="0.0.0.0", debug=True)

