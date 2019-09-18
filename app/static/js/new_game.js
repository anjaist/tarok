let buttons = document.getElementsByTagName('button');

let buttonNewGame = buttons[0];
let buttonJoinGame = buttons[1];
let button3Game = buttons[2];
let button4Game = buttons[3];

let infoText = document.getElementById('disabled-button-info');
let gameCardNewJoin = document.getElementById('game-options-new-join');
let gameCard34 = document.getElementById('game-options-3-4');
let gameCard3Players = document.getElementById('game-options-choose-players-3');


buttonNewGame.onmouseover = function(event) {
    if (buttonNewGame.className.includes('btn-greyedout')) {
        infoText.innerHTML = 'Igro imaš že aktivirano';
    };
};

buttonJoinGame.onmouseover = function(event) {
    if (buttonJoinGame.className.includes('btn-greyedout')) {
        infoText.innerHTML = 'Nimaš še nobene aktivne igre';
    };
};

button4Game.onmouseover = function(event) {
    infoText.innerHTML = 'Coming soon...ish :)';
};

function mouseLeave() {
    infoText.innerHTML = '';
}

buttonNewGame.addEventListener('click', function() {
    gameCardNewJoin.classList.toggle('game-options-flipped');
    gameCard34.classList.toggle('game-options-flipped');
});


button3Game.addEventListener('click', function() {
    gameCard34.classList.toggle('game-options-flipped');
    gameCard3Players.classList.toggle('game-options-flipped');
});
