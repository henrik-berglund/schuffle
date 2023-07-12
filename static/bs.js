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
        for (let i = 0; i < 7; i++) {
            let dropzone = this.CreateDropZone(`rack-${i}`);

            if ( i < this.scrambledWord.length ) {
                const tile = this.CreateLetter(i, this.scrambledWord[i]);
                dropzone.appendChild(tile);
            }

            this.letterRackElement.appendChild(dropzone);
            //this.letterRackElement.appendChild(tile);
        }

        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                let dropzone = this.CreateDropZone(`solution-${i}-${j}`);
                this.solutionRowElement.appendChild(dropzone);
            }
        }
        // For the solution row
//        this.Resizedropzones('#solution-row .dropzone', 15);

        // For the letter rack
        //this.Resizedropzones('#letter-rack .dropzone', 7);
        //this.Resizedropzones()
        this.AddBonusTiles();
        this.AddButtonListener();
        this.RegisterPopup();
        this.SetupSmoothDraggable();
    }
    RegisterPopup() {
        const selectLetterButton = document.getElementById('selectLetterButton');
        const letterSelectionModal = document.getElementById('letterSelectionModal');

        // Attach a click event listener to the button
        selectLetterButton.addEventListener('click', () => {
          // Show the modal
          const bootstrapModal = new bootstrap.Modal(letterSelectionModal);
          console.log("click modal");
          bootstrapModal.show();
        });

        // Attach a click event listener to the letter buttons
        const letterButtons = document.querySelectorAll('.letter-button');
        letterButtons.forEach((button) => {
          button.addEventListener('click', (event) => {
            // Get the selected letter
            const selectedLetter = event.target.dataset.letter;

            // Do something with the selected letter
            console.log('Selected Letter:', selectedLetter);

            // Close the modal
            const bootstrapModal = bootstrap.Modal.getInstance(letterSelectionModal);
            bootstrapModal.hide();
          });
        });


    }
    UpdateLetterFontSize(letterElement, isGrid) {
        letterElement.classList.remove('fs-1', 'fs-9'); // Remove existing font size classes
        letterElement.classList.remove('grid-letter', 'rack-letter'); // Remove existing font size classes

        if (isGrid) {
            console.log("Changing to grid letter")
            letterElement.classList.add('fs-8');
        } else {
            console.log("Changing to rack letter")

            letterElement.classList.add('fs-1');
        }
    }
    CreateLetter(i, letter) {
        const tile = document.createElement('div');
        tile.textContent = letter;
        tile.id = `tile${i}`;
        tile.draggable = true;

        tile.classList.add('letter', 'tile', 'fs-1');

        tile.ondragstart = (event) => {
            event.dataTransfer.setData("text", event.target.id);
            this.dragStartElement = event.target.parentElement; // Store drag start element
            console.log("Drag start from: ", event.target.parentElement.id );
        };

        //tile.className = 'letter tile fs-3';
        //tile.className = 'letter tile';

        return tile;
    }

    SetupSmoothDraggable2() {

        interact('.letter').draggable({
            listeners: {
                start (event) {
                    console.log(event.type, event.target)
                },
                move (event) {
                    position.x += event.dx
                    position.y += event.dy

                    event.target.style.transform =
                        `translate(${position.x}px, ${position.y}px)`
                },
            }
        })

    }


    SetupSmoothDraggable() {
        interact('.letter')
          .draggable({
            // Set the options for dragging
            inertia: true,
            modifiers: [
              interact.modifiers.restrict({
                // Specify the container boundaries (e.g., col-lg-4)
                restriction: '.drag-area',
                endOnly: true, // Allow dragging only when releasing the element
              })
            ],
            listeners: {
              // Event listener for the dragmove event
              move: dragMoveListener,
            },
          });
    }
        // Event listener function for the dragmove event

    CreateBonusTile(bonus, x, y) {
        const tile = document.createElement('div');
        tile.textContent = bonus;
        tile.className = 'bonus-tile';
        //tile.dataset.x = x;
        //tile.dataset.y = y;

        tile.classList.add('fs-7');

        if (bonus === 'TB') {
            tile.classList.add('tb-bonus');
        } else if (bonus === 'DB') {
            tile.classList.add('db-bonus');
        } else if (bonus === 'TO') {
            tile.classList.add('to-bonus');
        } else if (bonus === 'DO') {
            tile.classList.add('do-bonus');
        }

        tile.ondragover = (event) => {
            event.preventDefault();
        };

        return tile;
    }

    AddBonusTiles() {
        fetch('/layout.json')  // Assuming the API endpoint to fetch the board layout is '/api/layout'
            .then(response => response.json())
            .then(layoutData => {
                if (layoutData && layoutData.length >= 1) {
                    const bonusLayout = layoutData[0];

                    bonusLayout.forEach((row, rowIndex) => {
                        row.forEach((bonus, columnIndex) => {
                            if (bonus) {
                                const dropzoneId = `solution-${rowIndex}-${columnIndex}`;
                                const dropzone = document.getElementById(dropzoneId);
                                if (dropzone) {
                                    const bonusTile = this.CreateBonusTile(bonus);
                                    dropzone.appendChild(bonusTile);
                                }
                            }
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Error loading board layout:', error);
            });
    }



    CreateSpaceByShiftingRight(dropzone) {
        let nextDropzone = dropzone.nextElementSibling;
        let foundBlank = false;

        // Look for blank to right
        while ( nextDropzone && nextDropzone.hasChildNodes()) {
            nextDropzone = nextDropzone.nextElementSibling
        }
        if (nextDropzone) {

            while ( nextDropzone && !nextDropzone.hasChildNodes() && nextDropzone != dropzone) {
                let prevDropZone = nextDropzone.previousElementSibling;
                let prevChild = prevDropZone.firstChild;
                prevDropZone.removeChild(prevChild); // Needed?
                nextDropzone.appendChild(prevChild);
                nextDropzone = nextDropzone.previousElementSibling;
            }
            return true;
        } else {
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

            while ( previousDropzone && !previousDropzone.hasChildNodes() && previousDropzone != dropzone) {
                let nextDropZone = previousDropzone.nextElementSibling;
                let nextChild = nextDropZone.firstChild;
                nextDropZone.removeChild(nextChild); // Needed?
                previousDropzone.appendChild(nextChild);
                previousDropzone = previousDropzone.nextElementSibling;
            }
            return true;
        } else {
            return false;
        }

    }

    AddButtonListener() {
        let myButton = document.getElementById('play');
        myButton.addEventListener('click', function() {
            console.log('Play pressed!');} );

        myButton = document.getElementById('clear');
        myButton.addEventListener('click', function() {
            console.log('Clear pressed!');} );

        myButton = document.getElementById('shuffle');
        myButton.addEventListener('click', function() {
            console.log('Shuffle pressed!');} );

        myButton = document.getElementById('swap');
        myButton.addEventListener('click', function() {
            console.log('Swap pressed!');} );

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
            let is_bonus_tile = target.classList.contains("bonus-tile") ;
            let has_letter = target.classList.contains("letter");
            let target_is_grid = target.closest('#solution-row') !== null

            const hiddenBonusElement = this.dragStartElement.querySelector(".hidden");
            if ( hiddenBonusElement) {
                hiddenBonusElement.classList.remove("hidden");
            }

            // If the target is a dropzone and it is empty
            if (is_bonus_tile) {
                target.classList.add("hidden");
                target.parentNode.appendChild(letterTile);
            } else if (is_dropzone && !has_letter) {
                target.appendChild(letterTile);
            }
            // If the target already has a letter
            else if (is_dropzone && has_letter) {
                let dropzone = target.parentElement;
                let sourceDropzone = letterTile.parentElement;
                if ( sourceDropzone == dropzone) {
                    // Do nothing
                } else if ( this.CreateSpaceByShiftingRight(dropzone)) {
                    dropzone.appendChild(letterTile);
                } else if ( this.CreateSpaceByShiftingLeft(dropzone)) {
                    dropzone.appendChild(letterTile);
                } else { // reorder
                    sourceDropzone.removeChild(letterTile)

                    if (  this.CreateSpaceByShiftingRight(dropzone) || this.CreateSpaceByShiftingLeft(dropzone) ){
                        dropzone.appendChild(letterTile);
                    }
                }
            }

            this.UpdateLetterFontSize(letterTile, target_is_grid);

            let row = dropzone.parentElement.id;
            let numberOfBoxes = row == 'letter-rack' ? 7 : 15;
            //this.Resizedropzones(`#${dropzone.id}`, numberOfBoxes);


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
   function dragMoveListener(event) {
      var target = event.target;
      var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

      target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    }

window.onload = () => {
    game = new Game();
}

function checkAnswer() {
    game.checkWord();
}
