let game;

class Game {
    constructor() {
        this.scrambledWordElement = document.getElementById('scrambled-word');
        this.userInput = document.getElementById('user-input');
        this.resultElement = document.getElementById('result');
        this.fetchWord();
    }

    fetchWord() {
        fetch('/api/word')
            .then(response => response.json())
            .then(data => {
                this.scrambledWord = data.scrambled;
                this.solution = data.solutions[0];  // We take the first solution for simplicity
                this.scrambledWordElement.textContent = this.scrambledWord;
            });
    }

    checkWord() {
        const userWord = this.userInput.value;
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
