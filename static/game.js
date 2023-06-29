let game;

class Game {
    constructor() {
        this.letterRackElement = document.getElementById('letter-rack');
        this.solutionRowElement = document.getElementById('solution-row');
        this.resultElement = document.getElementById('result');
        this.fetchWord();
    }

    fetchWord() {
        fetch('/api/word')
            .then(response => response.json())
            .then(data => {
                this.scrambledWord = data.scrambled;
                this.solution = data.solutions[0];  // We take the first solution for simplicity
                this.renderTiles();
            });
    }

    renderTiles() {
        // Clear existing tiles and dropzones
        this.letterRackElement.innerHTML = '';
        this.solutionRowElement.innerHTML = '';

        // Create new tiles and dropzones
        for (let i = 0; i < this.scrambledWord.length; i++) {
            // Create a new tile
            const tile = document.createElement('div');
            tile.textContent = this.scrambledWord[i];
            tile.id = `tile${i}`;
            tile.draggable = true;
            tile.ondragstart = (event) => {
                event.dataTransfer.setData("text", event.target.id);
            };
            tile.className = 'letter';
            this.letterRackElement.appendChild(tile);

            // Create a new dropzone
            const dropzone = document.createElement('div');
            dropzone.ondrop = (event) => {
                event.preventDefault();
                const data = event.dataTransfer.getData("text");
                const target = event.target;
                const letterTile = document.getElementById(data);

                // If the target is a dropzone and it is empty
                if (target.classList.contains('dropzone') && !target.hasChildNodes()) {
                    target.appendChild(letterTile);
                }
                // If the target is the letter rack or a tile in the letter rack
                else if (target.id === 'letter-rack' || target.classList.contains('letter')) {
                    this.letterRackElement.appendChild(letterTile);
                }
            };
            dropzone.ondragover = (event) => {
                event.preventDefault();
            };
            dropzone.className = 'dropzone';
            this.solutionRowElement.appendChild(dropzone);
        }
    }

    checkWord() {
        const userWordArray = Array.from(this.solutionRowElement.children).map(child => child.textContent);
        const userWord = userWordArray.join('');
        if (userWord === this.solution) {
            this.resultElement.textContent = 'Correct!';
        } else {
            this.resultElement.textContent = 'Incorrect. Try again!';
        }
    }
}

window.onload = () => {
    game = new Game();
}

function checkAnswer() {
    game.checkWord();
}
