let game;

class Game {
    constructor() {
        this.rack = document.getElementById('rack');
        this.word = document.getElementById('word');
        this.resultElement = document.getElementById('result');
        this.fetchWord();
    }

    fetchWord() {
        fetch('/api/word')
            .then(response => response.json())
            .then(data => {
                this.solution = data.solutions[0];
                this.createTiles(data.scrambled);
            });
    }

    createTiles(scrambledWord) {
        // Remove old tiles if they exist
        while (this.rack.firstChild) {
            this.rack.removeChild(this.rack.firstChild);
        }

        for (let char of scrambledWord) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.textContent = char;
            tile.draggable = true;
            tile.ondragstart = this.dragStart;
            this.rack.appendChild(tile);
        }
    }

    dragStart(e) {
        e.dataTransfer.setData('text', e.target.textContent);
    }

    checkWord() {
        const userWord = Array.from(this.word.children).map(tile => tile.textContent).join('');
        if (userWord === this.solution) {
            this.resultElement.textContent = 'Correct!';
        } else {
            this.resultElement.textContent = 'Incorrect. Try again!';
        }
    }
}

window.onload = () => {
    game = new Game();

    const slots = document.getElementsByClassName('slot');
    for (let slot of slots) {
        slot.ondragover = e => e.preventDefault();
        slot.ondrop = e => {
            if (!e.target.classList.contains('tile')) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.textContent = e.dataTransfer.getData('text');
                e.target.appendChild(tile);
            }
        };
    }
}

function checkAnswer() {
    game.checkWord();
}
