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
        // Clear existing tiles and dropzone
        this.letterRackElement.innerHTML = '';
        this.solutionRowElement.innerHTML = '';

        // Calculate the number of blank squares needed
        const numBlanks = Math.max(7 - this.scrambledWord.length, 0);

        // Create tiles for the scrambled word
        for (let i = 0; i < this.scrambledWord.length; i++) {
            const tile = this.CreateLetter(i, this.scrambledWord[i]);

            let dropzone = this.CreateDropZone();
            dropzone.appendChild(tile);
            this.letterRackElement.appendChild(dropzone);
            //this.letterRackElement.appendChild(tile);
        }

        // Create dropzones in the solution row
        for (let i = 0; i < this.scrambledWord.length; i++) {
            let dropzone = this.CreateDropZone();
            this.solutionRowElement.appendChild(dropzone);
        }
    }

    CreateLetter(i, letter) {
        const tile = document.createElement('div');
        tile.textContent = letter;
        tile.id = `tile${i}`;
        tile.draggable = true;
        tile.ondragstart = (event) => {
            event.dataTransfer.setData("text", event.target.id);
        };
        tile.className = 'letter';
        return tile;
    }

    CreateSpaceByShiftingRight(dropzone) {
        const nextDropzone = dropzone.nextElementSibling;
        // Move the child of the target dropzone to the dropzone to the right
        if (nextDropzone) {
            if (nextDropzone.hasChildNodes()) {
                let next_child = nextDropzone.firstChild
                nextDropzone.removeChild(next_child);
            }
            let dropzone_child = dropzone.firstChild;
            dropzone.removeChild(dropzone_child)
            nextDropzone.appendChild(dropzone_child);
        }
        return true;
    }

    CreateDropZone() {
        const dropzone = document.createElement('div');
        dropzone.ondrop = (event) => {
            event.preventDefault();
            const data = event.dataTransfer.getData("text");
            const target = event.target;
            const letterTile = document.getElementById(data);


            let is_dropzone = target.classList.contains("dropzone") || target.parentElement.classList.contains("dropzone");
            let has_letter = target.classList.contains("letter");
            console.log("ondrop: ", is_dropzone, has_letter);


            // If the target is a dropzone and it is empty
            if (is_dropzone && !has_letter) {
                 console.log("no children");
                target.appendChild(letterTile);
            }
            // If the target already has a letter
            else if (is_dropzone && has_letter) {
                console.log("children");
                let dropzone = target.parentElement;


                if ( this.CreateSpaceByShiftingRight(dropzone)) {
                   dropzone.appendChild(letterTile);
                }
            }

        };

        dropzone.ondragover = (event) => {
            event.preventDefault();
        };
        dropzone.className = 'dropzone';

        return dropzone;
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
