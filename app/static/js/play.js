let socket = io.connect(window.location.protocol + '//' + document.domain + ':' + location.port);
let allOptions = ['three', 'two', 'one', 'pass'];

let currentUser = document.getElementById('current-user').content;
let gameId = document.getElementById('game-id').content;
let roundOptionsPopup = document.getElementById('round-options-popup');
let chooseGameDiv = document.getElementById('choose-game');
let isChoosingGameDiv = document.getElementById('is-choosing-game');
let currentlyChoosingPlayer = document.getElementById('player-to-choose').content;
let currentlyChoosingPlayerOptions = document.getElementById('player-to-choose-opts').content;
currentlyChoosingPlayerOptions = currentlyChoosingPlayerOptions.split(',');
let coPlayersChoiceDiv = document.getElementById('co-players-choice');

let noChoosingPlayer = currentlyChoosingPlayer == null || currentlyChoosingPlayer == 'None';


// show what co-players have chosen
function showCoPlayersChoice(coPlayersChoice) {
    Object.keys(coPlayersChoice).forEach(function(key) {
        let coPlayerChoiceDiv = document.getElementById(`${key}-choice`);
        if (coPlayerChoiceDiv) {
            coPlayerChoiceDiv.innerHTML = `${key}: ${coPlayersChoice[key]}`;
        };
    });
};


// deal with connection and disconnection events
socket.on('connect', function() {
    console.log('=> Websocket connected! <=');
    socket.emit('connect to playroom');
});

socket.on('a user connected', function(receivedData) {
    console.log(`User ${receivedData.connected_user} has joined`)
    let user = document.getElementById(receivedData.connected_user);
    if (user) {
        user.classList.remove('inactive-username');
        user.innerHTML = receivedData.connected_user
    }
    if (receivedData.connected_user == currentUser) {
        showCoPlayersChoice(receivedData.co_players_choice);
    };
});

socket.on('a user disconnected', function(username) {
    console.log(`User ${username} has left`);
    let user = document.getElementById(username);
    if (user) {
        user.classList.add('inactive-username');
        user.innnerText = `Čakamo na ${username}`
    }
});


// grey out options no longer available to player
function greyOutOptions() {
    allOptions.forEach(function(opt){
        if (currentlyChoosingPlayerOptions.includes(opt) === false) {
            document.getElementById(opt).disabled = true;
        } else {
            document.getElementById(opt).disabled = false;
        };
    });
};
greyOutOptions();


// get information on which player still needs to choose their game for current round
socket.on('player game options', function(receivedData) {
    currentlyChoosingPlayer = receivedData.player;
    currentlyChoosingPlayerOptions = receivedData.player_options;
    showCurrentlyChoosing();
    showCoPlayersChoice(receivedData.co_players_choice);
    greyOutOptions();
});


// show who is currently choosing their round options
function showCurrentlyChoosing() {
    if (noChoosingPlayer || currentlyChoosingPlayerOptions.includes('chosen')) {
        roundOptionsPopup.style.display = 'none';
        isChoosingGameDiv.style.display = 'none';
        // once everyone has chosen and the choose displayed is gone, send message to server side
        console.log('[SENDING] all users have chosen');
        socket.emit('current round', gameId);
    } else if (currentlyChoosingPlayer == currentUser) {
        chooseGameDiv.style.display = 'block';
        isChoosingGameDiv.style.display = 'none';
    } else {
        chooseGameDiv.style.display = 'none';
        isChoosingGameDiv.style.display = 'block';
        isChoosingGameDiv.innerHTML = `<h3>${currentlyChoosingPlayer} izbira igro</h3>`
    }
};
showCurrentlyChoosing()


// send options selected by each user for each round to server side
let roundOptionsButton = document.getElementById('round-options-btn');

roundOptionsButton.addEventListener('click', function() {
        let selectedOption = document.getElementById('round-options-form')['game-opt'].value;
        if (selectedOption) {
            // send selected option to server side
            console.log(`[SENDING] user: ${currentUser} choice: ${selectedOption}`);
            socket.emit('user choice', currentUser, selectedOption)

            showCurrentlyChoosing()
        }
});
