let socket = io.connect(window.location.protocol + '//' + document.domain + ':' + location.port);
let currentUser = document.getElementById('current-user').content;
let chooseGamePlayerOrder = document.getElementById('choose-game-player-order').content;
chooseGamePlayerOrder = chooseGamePlayerOrder.split(',');
let roundOptionsPopup = document.getElementById('round-options-popup');
let chooseGameDiv = document.getElementById('choose-game');
let isChoosingGameDiv = document.getElementById('is-choosing-game');
let alreadyChosen = document.getElementById('already-chosen').content;
alreadyChosen = alreadyChosen.split(',');

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


// grey out options no longer available to player
function greyOutOptions(option) {
    // grey out if selected option is 3, 2, or 1
    if (option == 'three' || option == 'two' || option == 'one') {
        document.getElementById(option).disabled = true;
    };

    // grey out options worth less than one already chosen, where: 1 > 2 > 3
    three = document.getElementById('three');
    two = document.getElementById('two');
    one = document.getElementById('one');
    if (one.disabled === true) {
        two.disabled = true;
    };
    if (two.disabled === true) {
        three.disabled = true;
    };
};

alreadyChosen.forEach(function(choice) {
    greyOutOptions(choice);
});


// get information on which player still needs to choose their game for current round
socket.on('players waiting to choose', function(receivedData) {
    chooseGamePlayerOrder = receivedData.players;
    let lastChoice = receivedData.last_choice;
    console.log(`[RECEIVED] players waiting to choose: ${chooseGamePlayerOrder}, last choice: ${lastChoice}`);

    greyOutOptions(lastChoice);
    showCurrentlyChoosing();
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
            // send selected option to server side
            console.log(`[SENDING] user: ${currentUser} choice: ${selectedOption}`);
            socket.emit('user choice', currentUser, selectedOption)

            chooseGamePlayerOrder.shift();
            showCurrentlyChoosing()
        }
});


// todo: user before you can choose again: the same or higher game
