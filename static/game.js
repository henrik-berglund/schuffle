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

            let dropzone = this.CreateDropZone(`rack-${i}`);
            dropzone.appendChild(tile);
            this.letterRackElement.appendChild(dropzone);
            //this.letterRackElement.appendChild(tile);
        }

        // Create dropzones in the solution row
        for (let i = 0; i < this.scrambledWord.length; i++) {
            let dropzone = this.CreateDropZone(`solution-${i}`);
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
            //event.target.parentElement.removeChild(event.target);
        };

        tile.className = 'letter';
        return tile;
    }

    CreateSpaceByShiftingRight(dropzone) {
        let nextDropzone = dropzone.nextElementSibling;
        let foundBlank = false;

        // Look for blank to right
        while ( nextDropzone && nextDropzone.hasChildNodes()) {
            nextDropzone = nextDropzone.nextElementSibling
        }
        if (nextDropzone) {
            console.log("found space to right, id: ", nextDropzone.id);
            console.log("hasChildNodes: ", nextDropzone.hasChildNodes());

            while ( nextDropzone && !nextDropzone.hasChildNodes() && nextDropzone != dropzone) {
                let prevDropZone = nextDropzone.previousElementSibling;
                let prevChild = prevDropZone.firstChild;
                prevDropZone.removeChild(prevChild); // Needed?
                nextDropzone.appendChild(prevChild);
                nextDropzone = nextDropzone.previousElementSibling;
            }
            return true;
        } else {
            console.log("found no space to right");
            return false;
        }

    }
    CreateSpaceByShiftingLeft(dropzone) {
        let previousDropzone = dropzone.previousElementSibling;

        // Look for blank to left
        while ( previousDropzone && previousDropzone.hasChildNodes()) {
            previousDropzone = previousDropzone.previousElementSibling
        }
        if (previousDropzone) {
            console.log("found space to left, id: ", previousDropzone.id);
            console.log("hasChildNodes: ", previousDropzone.hasChildNodes());

            while ( previousDropzone && !previousDropzone.hasChildNodes() && previousDropzone != dropzone) {
                let nextDropZone = previousDropzone.nextElementSibling;
                let nextChild = nextDropZone.firstChild;
                nextDropZone.removeChild(nextChild); // Needed?
                previousDropzone.appendChild(nextChild);
                previousDropzone = previousDropzone.nextElementSibling;
            }
            return true;
        } else {
            console.log("found no space to left");
            return false;
        }

    }
    CreateDropZone(id) {
        const dropzone = document.createElement('div');
        dropzone.id = id;

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
                } else if ( this.CreateSpaceByShiftingLeft(dropzone)) {
                   dropzone.appendChild(letterTile);
                } else { // reorder
                    console.log("reorder");
                    let sourceDropzone = letterTile.parentElement;
                    sourceDropzone.removeChild(letterTile)

                    if (  this.CreateSpaceByShiftingRight(dropzone) || this.CreateSpaceByShiftingLeft(dropzone) ){
                       dropzone.appendChild(letterTile);
                    }
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
