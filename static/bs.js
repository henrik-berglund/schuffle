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
        this.ReadAndRenderBoard();
        this.AddButtonListener();
        this.RegisterPopup();
        this.SetupSmoothDraggable();
        this.SetupSmoothDrop();
        this.CreateLetterSelectionBox();
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
        //console.log("updating");
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
    CreateLetterSelectionBox() {
    // Get the letterSelectionRow element
    const letterSelectionRow = document.getElementById('letterSelectionRow');

    // Define the range of letters to add
    const startCharCode = 'A'.charCodeAt();
    const endCharCode = 'P'.charCodeAt();
    const additionalLetters = ['R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', 'Å', 'Ä', 'Ö'];

    // Create a row for the letter buttons
    const row = document.createElement('div');
    row.classList.add('row', 'row-cols-auto', 'g-2');

    // Loop through the range and additional letters to create buttons
    for (let charCode = startCharCode; charCode <= endCharCode; charCode++) {
        const letter = String.fromCharCode(charCode);
        createLetterButton(letter);
    }

    additionalLetters.forEach(letter => {
        createLetterButton(letter);
    });

    letterSelectionRow.appendChild(row);

    // Function to create a letter button
    function createLetterButton(letter) {
        const col = document.createElement('div');
        col.classList.add('col');

        const button = document.createElement('button');
        button.classList.add('letter-button', 'btn', 'btn-outline-primary');
        button.setAttribute('data-letter', letter);
        button.setAttribute('data-bs-dismiss', 'modal'); // Close the modal when clicked

        button.textContent = letter;

        col.appendChild(button);
        row.appendChild(col);
    }
}
    CreateLetter(i, letter) {
        const tile = document.createElement('div');
        tile.textContent = letter;

        const superscript = document.createElement('sup');
        superscript.textContent = '7';
        superscript.classList.add('superscript'); // Add the class name for styling
        tile.appendChild(superscript);

        tile.id = `tile${i}`;
        tile.draggable = true;
        tile.classList.add('letter', 'tile', 'fs-1');

        return tile;
    }

    _CreateLetter(i, letter) {
        const tile = document.createElement('div');
        tile.textContent = letter;
        tile.id = `tile${i}`;
        tile.draggable = true;

        tile.classList.add('letter', 'tile', 'fs-1');
        //tile.style.zIndex = '9999'

        //tile.className = 'letter tile fs-3';
        //tile.className = 'letter tile';

        return tile;
    }

    SetupSmoothDrop() {
        const dropzones = document.querySelectorAll('.dropzone');

        Array.from(dropzones).forEach((dropzone, index) => {
            interact(dropzone).dropzone({
                // only accept elements matching this CSS selector
                accept: '.letter',
                overlap: 'center',

                ondrop: function (event) {
                     event.preventDefault();
                    //event.relatedTarget.textContent = 'Dropped';
                    //console.log("Dropped target: ", event.target);
                    //console.log("Dropped related: ", event.relatedTarget);
                    //event.target.appendChild(event.relatedTarget);
                    //event.relatedTarget.style.zIndex = 1;

                    event.relatedTarget.removeAttribute('style');

                    event.relatedTarget.setAttribute('data-x', 0);
                    event.relatedTarget.setAttribute('data-y', 0);
                    this.HandleDrop(event.relatedTarget, event.target);

                }.bind(this)
            })
        });
    }

    HandleDrop(letterTile, target) {
        console.log("***old drop handler called: ", letterTile, target);

        let is_dropzone = target.classList.contains("dropzone") || target.parentElement.classList.contains("dropzone");
        let is_bonus_tile = target.classList.contains("bonus-tile") ;
        let has_letter = target.querySelector('.letter');
        let target_is_grid = target.closest('#solution-row') !== null

        console.log("target: ", target);
        console.log("has_letter: ", has_letter);
        console.log("is_dropzone: ", is_dropzone);
        console.log("target is grid: ", target_is_grid);

        const hiddenBonusElement = this.dragStartElement.querySelector(".hidden");
        if ( hiddenBonusElement) {
            hiddenBonusElement.classList.remove("hidden");
        }

        // If the target is a dropzone and it is empty
        if (is_bonus_tile) {
            target.classList.add("hidden");
            target.parentNode.appendChild(letterTile);
            this.UpdateLetterFontSize(letterTile, target_is_grid);
        } else if (is_dropzone && !has_letter) {
            target.appendChild(letterTile);
            this.UpdateLetterFontSize(letterTile, target_is_grid);
        }
        // If the target already has a letter
        else if (is_dropzone && has_letter && !target_is_grid) {
            let dropzone = target;
            let sourceDropzone = this.dragStartElement;
            this.UpdateLetterFontSize(letterTile, target_is_grid);

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


        //let row = dropzone.parentElement.id;
        //let numberOfBoxes = row == 'letter-rack' ? 7 : 15;
        //this.Resizedropzones(`#${dropzone.id}`, numberOfBoxes);


    };

    SetupSmoothDraggable() {
        interact('.letter')
            .draggable({
                inertia: true,
                modifiers: [
                    interact.modifiers.restrictRect({
                        restriction: 'window',
                        endOnly: true
                    }),
                ],
                autoScroll: true,
                // dragMoveListener from the dragging demo above
                listeners: {
                    move: dragMoveListener,
                    start: function (event) {
                        event.target.style.zIndex = '9999'; // Set a high z-index value
                        this.dragStartElement = event.target;
                        this.dragOriginalPosition = { x: event.target.x, y: event.target.y };
                        console.log("Saving ", this.dragOriginalPosition);
                    }.bind(this),

                    end: function (event) {
                        event.target.style.zIndex = ''; // Reset the z-index value

                        const dropzone = event.relatedTarget;
                        if (!dropzone || !dropzone.classList.contains('dropzone')) {
                            console.log("resetting pos to ", this.dragOriginalPosition);
                            // Reset the position of the letter tile to its original coordinates
                            event.target.style.transform = `translate(${this.dragOriginalPosition.x}px, ${this.dragOriginalPosition.y}px)`;
                        }
                    }.bind(this)
                }
            })
    }



    CreateGridTile(bonus, x, y) {
        const tile = document.createElement('div');
        tile.textContent = bonus;
        tile.className = 'bonus-tile';
        //tile.dataset.x = x;
        //tile.dataset.y = y;

        tile.classList.add('fs-6');

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

    ReadAndRenderBoard() {
        fetch('/layout.json')  // Assuming the API endpoint to fetch the board layout is '/api/layout'
            .then(response => response.json())
            .then(layoutData => {
                if (layoutData && layoutData.length >= 1) {
                    const boardLayout = layoutData[0];

                    boardLayout.forEach((row, rowIndex) => {
                        row.forEach((tile, columnIndex) => {
                            if (tile) {
                                const dropzoneId = `solution-${rowIndex}-${columnIndex}`;
                                const dropzone = document.getElementById(dropzoneId);
                                if (dropzone) {
                                    const bonusTile = this.CreateGridTile(tile);
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

     MoveTilesToRack() {
        const solutionRow = document.getElementById('solution-row');
        const letterRack = document.getElementById('letter-rack');

        for (let i = 0; i < solutionRow.children.length; i++) {
            const dropzone = solutionRow.children[i];
            const letterTile = dropzone.querySelector('.letter');

            if (letterTile) {
                const emptySlot = this.FindEmptySlot(letterRack);

                if (emptySlot) {
                    emptySlot.appendChild(letterTile);
                    this.UpdateLetterFontSize(letterTile, false);

                    const bonusTile = dropzone.querySelector('.bonus-tile');
                    if (bonusTile) {
                        bonusTile.classList.remove('hidden');
                    }
                }
            }
        }
    }
    MixLetters() {
        const letterRack = document.getElementById('letter-rack');
        const dropzones = Array.from(letterRack.querySelectorAll('.dropzone'));

        const letterTiles = dropzones.reduce((tiles, dropzone) => {
            const letterTile = dropzone.querySelector('.letter');
            if (letterTile) {
                tiles.push(letterTile);
                dropzone.removeChild(letterTile);
            }
            return tiles;
        }, []);

        let swapped;
        do {
            swapped = false;
            for (let i = letterTiles.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                if (i !== j) {
                    [letterTiles[i], letterTiles[j]] = [letterTiles[j], letterTiles[i]];
                    swapped = true;
                }
            }
        } while (!swapped);

        // Append the shuffled letter tiles back to the dropzones
        dropzones.forEach((dropzone, index) => {
            if (index < letterTiles.length) {
                dropzone.appendChild(letterTiles[index]);
            }
        });
    }

    FindEmptySlot(letterRack) {
        const dropzones = letterRack.querySelectorAll('.dropzone');

        // Iterate over the dropzones in the letter rack
        for (let i = 0; i < dropzones.length; i++) {
            const dropzone = dropzones[i];

            // Check if the dropzone is empty
            if (!dropzone.firstChild) {
                return dropzone;
            }
        }

        // If no empty slot is found, return null
        return null;
    }


    AddButtonListener() {
        let myButton = document.getElementById('play');
        myButton.addEventListener('click', function() {
            console.log('Play pressed!');} );

        myButton = document.getElementById('clear');
        myButton.addEventListener('click', function() {
            console.log('Clear pressed!');
            this.MoveTilesToRack()
        }.bind(this) );

        myButton = document.getElementById('shuffle');
        myButton.addEventListener('click', function() {
            console.log('Shuffle pressed!');
            this.MixLetters();
        }.bind(this) );

        myButton = document.getElementById('swap');
        myButton.addEventListener('click', function() {
            console.log('Swap pressed!');} );

    }


    CreateDropZone(id) {
        const dropzone = document.createElement('div');
        dropzone.id = id;

        dropzone._ondrop = (event) => {
            console.log("***old drop handler called");
            event.preventDefault();
            const data = event.dataTransfer.getData("text");
            const target = event.target;
            const letterTile = document.getElementById(data);

            let is_dropzone = target.classList.contains("dropzone") || target.parentElement.classList.contains("dropzone");
            let is_bonus_tile = target.classList.contains("bonus-tile") ;
            let has_letter = target.classList.contains("letter");
            let target_is_grid = target.closest('#solution-row') !== null

            console.log("target is grid: ", target_is_grid);
            //const hiddenBonusElement = this.dragStartElement.querySelector(".hidden");
            //if ( hiddenBonusElement) {
            //    hiddenBonusElement.classList.remove("hidden");
            //}

            // If the target is a dropzone and it is empty
            if (is_bonus_tile) {
                target.classList.add("hidden");
                target.parentNode.appendChild(letterTile);
            } else if (is_dropzone && !has_letter) {
                target.appendChild(letterTile);
            }
            // If the target already has a letter
            else if (is_dropzone && has_letter && !target_is_grid) {
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

window.onload = () => {
    game = new Game();
}

function checkAnswer() {
    game.checkWord();
}
function dragMoveListener (event) {
    var target = event.target
    // keep the dragged position in the data-x/data-y attributes
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

    // translate the element
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

    // update the posiion attributes
    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)
}

