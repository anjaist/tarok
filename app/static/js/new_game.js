let buttons = document.getElementsByTagName('button');

let buttonNewGame = buttons[0]
let buttonJoinGame = buttons[1]

let infoText = document.getElementById('disabled-button-info')


buttonNewGame.onmouseover = function (event) {
    if (buttonNewGame.className.includes('btn-greyedout')) {
        infoText.innerHTML = 'Igro imaš že aktivirano'
    };
};

buttonJoinGame.onmouseover = function (event) {
    if (buttonJoinGame.className.includes('btn-greyedout')) {
        infoText.innerHTML = 'Nimaš še nobene aktivne igre'
    };
};

function mouseLeave() {
    infoText.innerHTML = ''
}
