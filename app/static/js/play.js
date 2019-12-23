let socket = io.connect(window.location.protocol + '//' + document.domain + ':' + location.port);
let currentUser = document.getElementById('current-user').content;
let playerOrder = document.getElementById('player-order').content;
playerOrder = playerOrder.split(',');
chooseGamePlayerOrder = playerOrder.slice(0);
let roundOptionsPopup = document.getElementById('round-options-popup');


// deal with connection and disconnection events
socket.on('connect', function() {
    console.log('=> Websocket connected! <=');
    socket.emit('connect to playroom');
});

socket.on('a user connected', function(username) {
    console.log(`User ${username} has joined`)
    let user = document.getElementById(username);
    if (user) {
        user.classList.remove('inactive-username');
        user.innerHTML = username
    }
});

socket.on('a user disconnected', function(username) {
    console.log(`User ${username} has left`);
    let user = document.getElementById(username);
    if (user) {
        user.classList.add('inactive-username');
        user.innnerText = `Čakamo na ${username}`
    }
});


let chooseGameDiv = document.getElementById('choose-game')
let isChoosingGameDiv = document.getElementById('is-choosing-game')


// show who is currently choosing their round options
if (!chooseGamePlayerOrder) {
    roundOptionsButton.style.display = 'none';
} else if (chooseGamePlayerOrder[0] == currentUser) {
    chooseGameDiv.style.display = 'block';
    isChoosingGameDiv.style.display = 'none';
} else {
    chooseGameDiv.style.display = 'none';
    isChoosingGameDiv.style.display = 'block';
    isChoosingGameDiv.innerHTML = `<h3>${chooseGamePlayerOrder[0]} izbira igro</h3>`
}


// send options selected by each user for each round to server side
let roundOptionsButton = document.getElementById('round-options-btn');

roundOptionsButton.addEventListener('click', function() {
        let selectedOption = document.getElementById('round-options-form')['game-opt'].value;

        if (selectedOption) {
            console.log(`[SENDING] user: ${currentUser} choice: ${selectedOption}`);
            socket.emit('user choice', currentUser, selectedOption)
        }
        chooseGamePlayerOrder.shift();
});

// todo: move chooseGamePlayerOrder as var in python to keep it updated with redis db and display correctly (updated) in JS
// todo: grey out options that have been selected by previous user if applicable
