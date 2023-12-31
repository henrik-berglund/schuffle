let game;
const letter_data = {
  'a': [9, 1],
  'b': [2, 3],
  'c': [1, 8],
  'd': [5, 1],
  'e': [8, 1],
  'f': [2, 3],
  'g': [3, 2],
  'h': [2, 3],
  'i': [5, 1],
  'j': [1, 7],
  'k': [3, 3],
  'l': [5, 2],
  'm': [3, 3],
  'n': [6, 1],
  'o': [6, 2],
  'p': [2, 4],
  'r': [8, 1],
  's': [8, 1],
  't': [9, 1],
  'u': [3, 4],
  'v': [2, 3],
  'x': [1, 8],
  'y': [1, 7],
  'z': [1, 8],
  'å': [2, 4],
  'ä': [2, 4],
  'ö': [2, 4]
};

function getLetterScore(letter) {
  const lowercaseLetter = letter.toLowerCase();
  if (letter_data.hasOwnProperty(lowercaseLetter)) {
    return letter_data[lowercaseLetter][1];
  } else {
    return 0; // Return 0 if the letter is not found in the letter_data
  }
}

class Game {
    constructor() {
        this.letterRackElement = document.getElementById('letter-rack');
        this.solutionRowElement = document.getElementById('solution-row');
        this.resultElement = document.getElementById('result');
        this.selectedLetter = null; // Initialize selectedLetter property
        this.RenderTiles();
    }

    RenderTiles() {
        // Clear existing tiles and dropzone
        this.letterRackElement.innerHTML = '';
        this.solutionRowElement.innerHTML = '';


        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                let dropzone = this.CreateDropZone(`solution-${i}-${j}`);
                this.solutionRowElement.appendChild(dropzone);
            }
        }

        this.ReadAndRenderBoard();

        this.AddButtonListener();

        //this.SetupSmoothDraggable();
        //this.SetupSmoothDrop();
        this.CreateLetterSelectionBox();

    }

    FillLetterRack(letters) {
        // Calculate the number of blank squares needed
        const numBlanks = Math.max(7 - letters.length, 0);

        for (let i = 0; i < 7; i++) {
            let dropzone = this.CreateDropZone(`rack-${i}`);

            if (i < letters.length) {
                const tile = this.CreateLetter(letters[i].toUpperCase(), 'fs-1', 'letter');
                dropzone.appendChild(tile);
            }
            this.letterRackElement.appendChild(dropzone);
        }
    }

    LetterSelectorPopup() {
        const selectLetterButton = document.getElementById('selectLetterButton');
        const letterSelectionModal = document.getElementById('letterSelectionModal');

        return new Promise((resolve, reject) => {
            // Attach a click event listener to the button

            const bootstrapModal = new bootstrap.Modal(letterSelectionModal);
            bootstrapModal.show();

            // Attach a click event listener to the letter buttons
            const letterButtons = document.querySelectorAll('.letter-button');
            letterButtons.forEach((button) => {
                button.addEventListener('click', (event) => {
                    // Get the selected letter
                    const selectedLetter = event.target.dataset.letter;

                    // Close the modal
                    const bootstrapModal = bootstrap.Modal.getInstance(letterSelectionModal);
                    bootstrapModal.hide();

                    // Resolve the promise with the selected letter
                    resolve(selectedLetter);
                });
            });
        });
    }



    UpdateLetterFontSize(letterElement, isGrid) {
        //console.log("updating");
        letterElement.classList.remove('fs-1', 'fs-9'); // Remove existing font size classes
        letterElement.classList.remove('grid-letter', 'rack-letter'); // Remove existing font size classes

        if (isGrid) {
            //console.log("Changing to grid letter")
            letterElement.classList.add('fs-8');
        } else {
            //console.log("Changing to rack letter")

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
    CreateLetter(letter, size, class_name) {
        const tile = document.createElement('div');
        if ( letter === '*') {
            tile.textContent = "";
        } else {
            tile.textContent = letter;

            const superscript = document.createElement('sup');
            superscript.textContent = getLetterScore(letter)
            superscript.classList.add('superscript'); // Add the class name for styling
            tile.appendChild(superscript);
        }

        tile.classList.add(class_name, 'tile', size);

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
        //console.log("HandleDrop called: ", letterTile, target);

        let is_dropzone = target.classList.contains("dropzone")
                                    || target.parentElement.classList.contains("dropzone");
        let is_bonus_tile = target.classList.contains("bonus-tile") ;
        let has_letter = target.querySelector('.letter')
                            || target.querySelector('.fixedletter');
        let target_is_grid = target.closest('#solution-row') !== null
        const is_wildcard = !letterTile.querySelector('sup');

        //console.log("target: ", target);
        //console.log("has_letter: ", has_letter);
        //console.log("is_dropzone: ", is_dropzone);
        //console.log("target is grid: ", target_is_grid);

        if ( is_wildcard ) {
            letterTile.textContent = "";
        }

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
            if ( is_wildcard && target_is_grid ) {
                game.LetterSelectorPopup().then((selectedLetter) => {
                    letterTile.textContent = selectedLetter;
                    target.appendChild(letterTile);
                    this.UpdateLetterFontSize(letterTile, target_is_grid);
                });
            } else {
                target.appendChild(letterTile);
                this.UpdateLetterFontSize(letterTile, target_is_grid);
            }
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
                    }.bind(this),

                    end: function (event) {
                        event.target.style.zIndex = ''; // Reset the z-index value

                        const dropzone = event.relatedTarget;
                        if (!dropzone || !dropzone.classList.contains('dropzone')) {
                            // Reset the position of the letter tile to its original coordinates
                            event.target.style.transform = `translate(${this.dragOriginalPosition.x}px, ${this.dragOriginalPosition.y}px)`;
                        }
                    }.bind(this)
                }
            })
    }


    CreateGridTile(tile, x, y) {
        const bonusStrings = ['TB', 'DB', 'TO', 'DO'];

        // Check if the input string is one of the four two-letter strings
        if (bonusStrings.includes(tile)) {
            return this.CreateBonusTile(tile, x, y);
        } else {
            return this.CreateLetter(tile.toUpperCase(), 'fs-8', 'fixedletter');
        }
    }


    CreateBonusTile(bonus, x, y) {
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
        fetch('/new_game')
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

                    let letterRack = layoutData[1];
                    //console.log("letter rack fetch: ", letterRack);
                    this.FillLetterRack(letterRack);
                    this.SetupSmoothDraggable();
                    this.SetupSmoothDrop();
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
                const is_wildcard = !letterTile.querySelector('sup');
                if ( is_wildcard ) {
                    letterTile.textContent = "";
                }

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

    PlayButtonHandler() {
        console.log("play b ha")
        // Gather the required elements
        const solutionRow = document.getElementById('solution-row');
        const letterRack = document.getElementById('letter-rack');
        const letterTiles = solutionRow.querySelectorAll('.letter');
        const remainingTilesInRack = letterRack.querySelectorAll('.letter');

        // Call the sendNewMove function with the required parameters
        this.SendNewMove(solutionRow, letterTiles, remainingTilesInRack);
    }


    AddButtonListener() {
        let myButton = document.getElementById('play');
        myButton.addEventListener('click', this.PlayButtonHandler.bind(this) );

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

        dropzone.ondragover = (event) => {
            event.preventDefault();
        };

        dropzone.className = 'dropzone';
        return dropzone;
    }

    SendNewMove(grid, letterTiles, remainingTilesInRack) {
    // Step 1: Gather information for the "grid" parameter
    const gridData = [];
    for (let row = 0; row < 15; row++) {
        gridData.push([]);
        for (let col = 0; col < 15; col++) {
            const dropzone = document.getElementById(`solution-${row}-${col}`);
            const letterTile = dropzone.querySelector('.fixedletter');
            const bonusTile = dropzone.querySelector('.bonus-tile');

          if (letterTile) {
                let letter = letterTile.textContent[0]; // Get the first character (letter) from textContent
                gridData[row].push(letter);
            } else if (bonusTile) {
                gridData[row].push(bonusTile.textContent);
            } else {
                gridData[row].push("");
            }
        }
    }

    // Step 2: Gather information for the "letterTiles" parameter
    const draggedLetterTiles = [];
    for (const letterTile of letterTiles) {
        const dropzoneId = letterTile.parentElement.id;
        const [, row, col] = dropzoneId.match(/solution-(\d+)-(\d+)/);
        let letter = letterTile.textContent[0]
        if (!letterTile.querySelector('sup')) {
            // If there is no superscript, it's a wildcard letter, so prefix with *
            letter = '*' + letter;
        }

        draggedLetterTiles.push({
            x: Number(col),
            y: Number(row),
            value: letter
        });
    }

        // Step 3: Build the data to be sent in the POST request
        const postData = {
            grid: gridData,
            playedLetters: draggedLetterTiles,
            remainingTilesInRack: Array.from(remainingTilesInRack).map(tile => {
                const letter = tile.textContent ? tile.textContent[0] : "*"; // If no letter, treat it as a wildcard
                return letter;
            }),
        };


    // Step 4: Send the POST request
    fetch('/new_move', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
    })
    .then(response => response.json())
    .then(data => {
        // Handle the server response here
        console.log('Server response:', data);
    })
    .catch(error => {
        console.error('Error sending new move:', error);
    });
}

}

window.onload = () => {
    game = new Game();
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

