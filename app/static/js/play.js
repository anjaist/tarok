let socket = io.connect(window.location.protocol + '//' + document.domain + ':' + location.port);
let currentUser = document.getElementById('current-user').content;
let playerOrder = document.getElementById('player-order').content;
playerOrder = playerOrder.split(',');
let chooseGamePlayerOrder = document.getElementById('choose-game-player-order').content;
chooseGamePlayerOrder = chooseGamePlayerOrder.split(',');
let roundOptionsPopup = document.getElementById('round-options-popup');
let chooseGameDiv = document.getElementById('choose-game')
let isChoosingGameDiv = document.getElementById('is-choosing-game')


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


// get information on which player still needs to choose their game for current round
socket.on('players waiting to choose', function(players) {
    console.log(`[RECEIVED] players waiting to choose: ${players}`)
    chooseGamePlayerOrder = players
});


// show who is currently choosing their round options
function showCurrentlyChoosing() {
    if (chooseGamePlayerOrder == false) {
        roundOptionsPopup.style.display = 'none';
    } else if (chooseGamePlayerOrder[0] == currentUser) {
        chooseGameDiv.style.display = 'block';
        isChoosingGameDiv.style.display = 'none';
    } else {
        chooseGameDiv.style.display = 'none';
        isChoosingGameDiv.style.display = 'block';
        isChoosingGameDiv.innerHTML = `<h3>${chooseGamePlayerOrder[0]} izbira igro</h3>`
    }
};
showCurrentlyChoosing()


// send options selected by each user for each round to server side
let roundOptionsButton = document.getElementById('round-options-btn');

roundOptionsButton.addEventListener('click', function() {
        let selectedOption = document.getElementById('round-options-form')['game-opt'].value;

        if (selectedOption) {
            console.log(`[SENDING] user: ${currentUser} choice: ${selectedOption}`);
            socket.emit('user choice', currentUser, selectedOption)
        }
        chooseGamePlayerOrder.shift();
        showCurrentlyChoosing()
});


// TODO: debug "player waiting to choose" to show REAL TIME updates
// todo: grey out options that have been selected by previous user if applicable
