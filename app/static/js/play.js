let socket = io.connect(window.location.protocol + '//' + document.domain + ':' + location.port);
let allOptions = ['three', 'two', 'one', 'pass'];
let gameTypeTranslation = {'three': 'tri', 'two': 'dve', 'one': 'ena', 'pass': 'naprej'}

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
let isTalonShown = false;

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


let talonBack = document.getElementById('talon-back');
let talonFront = document.getElementById('talon-front');

function revealTalon() {
    talonBack.style.display = 'none';
    talonFront.style.display = 'flex';
    isTalonShown = true;
};


// show who is currently choosing their round options
function showCurrentlyChoosing() {
    if (noChoosingPlayer || currentlyChoosingPlayerOptions.includes('chosen')) {
        roundOptionsPopup.style.display = 'none';
        isChoosingGameDiv.style.display = 'none';

        // once everyone has chosen and the choose display is gone, send message to server side
        console.log('[SENDING] all users have chosen');
        socket.emit('current round', gameId);

        // flip the talon cards
        revealTalon();

    } else if (currentlyChoosingPlayer == currentUser) {
        // show the game options to player, whose turn it is currently to choose
        chooseGameDiv.style.display = 'block';
        isChoosingGameDiv.style.display = 'none';

    } else {
        // if another player is choosing, hide the game options and show that another player is choosing
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


// highlight available talon cards grouped according to the type of game played
let gameType = null;
let talonCard1 = document.getElementById('talon-card-img-1');
let talonCard2 = document.getElementById('talon-card-img-2');
let talonCard3 = document.getElementById('talon-card-img-3');
let talonCard4 = document.getElementById('talon-card-img-4');
let talonCard5 = document.getElementById('talon-card-img-5');
let talonCard6 = document.getElementById('talon-card-img-6');
let talonCardBg1 = document.getElementById('talon-card-bg-1');
let talonCardBg2 = document.getElementById('talon-card-bg-2');
let talonCardBg3 = document.getElementById('talon-card-bg-3');
let talonCardBg4 = document.getElementById('talon-card-bg-4');
let talonCardBg5 = document.getElementById('talon-card-bg-5');
let talonCardBg6 = document.getElementById('talon-card-bg-6');


function highlightTalonCard(cardElement, cardBgElement) {
    cardElement.style.opacity = '0.5';
    cardBgElement.style.background = 'green';
}

function removeHighlightTalonCard(cardElement, cardBgElement) {
    cardElement.style.opacity = '1';
    cardBgElement.style.background = null;
}


function displayTalonOptions(playerName) {
    if (isTalonShown && currentUser == playerName) {
        if (gameType == 'one') {
            talonCard1.onmouseover = function(event) {
                highlightTalonCard(talonCard1, talonCardBg1);
            }
            talonCard1.onmouseout = function(event) {
                removeHighlightTalonCard(talonCard1, talonCardBg1);
            }
            talonCard2.onmouseover = function(event) {
                highlightTalonCard(talonCard2, talonCardBg2);
            }
            talonCard2.onmouseout = function(event) {
                removeHighlightTalonCard(talonCard2, talonCardBg2);
            }
            talonCard3.onmouseover = function(event) {
                highlightTalonCard(talonCard3, talonCardBg3);
            }
            talonCard3.onmouseout = function(event) {
                removeHighlightTalonCard(talonCard3, talonCardBg3);
            }
            talonCard4.onmouseover = function(event) {
                highlightTalonCard(talonCard4, talonCardBg4);
            }
            talonCard4.onmouseout = function(event) {
                removeHighlightTalonCard(talonCard4, talonCardBg4);
            }
            talonCard5.onmouseover = function(event) {
                highlightTalonCard(talonCard5, talonCardBg5);
            }
            talonCard5.onmouseout = function(event) {
                removeHighlightTalonCard(talonCard5, talonCardBg5);
            }
            talonCard6.onmouseover = function(event) {
                highlightTalonCard(talonCard6, talonCardBg6);
            }
            talonCard6.onmouseout = function(event) {
                removeHighlightTalonCard(talonCard6, talonCardBg6);
            }
        } else if (gameType == 'two') {
            talonCard1.onmouseover = function(event) {
                highlightTalonCard(talonCard1, talonCardBg1);
                highlightTalonCard(talonCard2, talonCardBg2);
            }
            talonCard1.onmouseout = function(event) {
                removeHighlightTalonCard(talonCard1, talonCardBg1);
                removeHighlightTalonCard(talonCard2, talonCardBg2);
            }
            talonCard2.onmouseover = function(event) {
                highlightTalonCard(talonCard1, talonCardBg1);
                highlightTalonCard(talonCard2, talonCardBg2);
            }
            talonCard2.onmouseout = function(event) {
                removeHighlightTalonCard(talonCard1, talonCardBg1);
                removeHighlightTalonCard(talonCard2, talonCardBg2);
            }
            talonCard3.onmouseover = function(event) {
                highlightTalonCard(talonCard3, talonCardBg3);
                highlightTalonCard(talonCard4, talonCardBg4);
            }
            talonCard3.onmouseout = function(event) {
                removeHighlightTalonCard(talonCard3, talonCardBg3);
                removeHighlightTalonCard(talonCard4, talonCardBg4);
            }
            talonCard4.onmouseover = function(event) {
                highlightTalonCard(talonCard3, talonCardBg3);
                highlightTalonCard(talonCard4, talonCardBg4);
            }
            talonCard4.onmouseout = function(event) {
                removeHighlightTalonCard(talonCard3, talonCardBg3);
                removeHighlightTalonCard(talonCard4, talonCardBg4);
            }
            talonCard5.onmouseover = function(event) {
                highlightTalonCard(talonCard5, talonCardBg5);
                highlightTalonCard(talonCard6, talonCardBg6);
            }
            talonCard5.onmouseout = function(event) {
                removeHighlightTalonCard(talonCard5, talonCardBg5);
                removeHighlightTalonCard(talonCard6, talonCardBg6);
            }
            talonCard6.onmouseover = function(event) {
                highlightTalonCard(talonCard5, talonCardBg5);
                highlightTalonCard(talonCard6, talonCardBg6);
            }
            talonCard6.onmouseout = function(event) {
                removeHighlightTalonCard(talonCard5, talonCardBg5);
                removeHighlightTalonCard(talonCard6, talonCardBg6);
            }
        } else if (gameType == 'three') {
            talonCard1.onmouseover = function(event) {
                highlightTalonCard(talonCard1, talonCardBg1);
                highlightTalonCard(talonCard2, talonCardBg2);
                highlightTalonCard(talonCard3, talonCardBg3);
            }
            talonCard1.onmouseout = function(event) {
                removeHighlightTalonCard(talonCard1, talonCardBg1);
                removeHighlightTalonCard(talonCard2, talonCardBg2);
                removeHighlightTalonCard(talonCard3, talonCardBg3);
            }
            talonCard2.onmouseover = function(event) {
                highlightTalonCard(talonCard1, talonCardBg1);
                highlightTalonCard(talonCard2, talonCardBg2);
                highlightTalonCard(talonCard3, talonCardBg3);
            }
            talonCard2.onmouseout = function(event) {
                removeHighlightTalonCard(talonCard1, talonCardBg1);
                removeHighlightTalonCard(talonCard2, talonCardBg2);
                removeHighlightTalonCard(talonCard3, talonCardBg3);
            }
            talonCard3.onmouseover = function(event) {
                highlightTalonCard(talonCard1, talonCardBg1);
                highlightTalonCard(talonCard2, talonCardBg2);
                highlightTalonCard(talonCard3, talonCardBg3);
            }
            talonCard3.onmouseout = function(event) {
                removeHighlightTalonCard(talonCard1, talonCardBg1);
                removeHighlightTalonCard(talonCard2, talonCardBg2);
                removeHighlightTalonCard(talonCard3, talonCardBg3);
            }
            talonCard4.onmouseover = function(event) {
                highlightTalonCard(talonCard4, talonCardBg4);
                highlightTalonCard(talonCard5, talonCardBg5);
                highlightTalonCard(talonCard6, talonCardBg6);
            }
            talonCard4.onmouseout = function(event) {
                removeHighlightTalonCard(talonCard4, talonCardBg4);
                removeHighlightTalonCard(talonCard5, talonCardBg5);
                removeHighlightTalonCard(talonCard6, talonCardBg6);
            }
            talonCard5.onmouseover = function(event) {
                highlightTalonCard(talonCard4, talonCardBg4);
                highlightTalonCard(talonCard5, talonCardBg5);
                highlightTalonCard(talonCard6, talonCardBg6);
            }
            talonCard5.onmouseout = function(event) {
                removeHighlightTalonCard(talonCard4, talonCardBg4);
                removeHighlightTalonCard(talonCard5, talonCardBg5);
                removeHighlightTalonCard(talonCard6, talonCardBg6);
            }
            talonCard6.onmouseover = function(event) {
                highlightTalonCard(talonCard4, talonCardBg4);
                highlightTalonCard(talonCard5, talonCardBg5);
                highlightTalonCard(talonCard6, talonCardBg6);
            }
            talonCard6.onmouseout = function(event) {
                removeHighlightTalonCard(talonCard4, talonCardBg4);
                removeHighlightTalonCard(talonCard5, talonCardBg5);
                removeHighlightTalonCard(talonCard6, talonCardBg6);
            }
        }
    }
}

let talonInfoDiv = document.getElementById('talon-info');

// display an info message about talon. The message is different for the main player
function displayTalonInfoMessage(mainPlayer, gameType) {
    if (currentUser == mainPlayer) {
        message = 'Izberi karte iz talona in karte iz roke za zamenjavo'
    } else {
        message = `${mainPlayer} načrtuje igro "${gameTypeTranslation[gameType]}"...`
    }
    talonInfoDiv.innerHTML = message;
}


// get information on the current round being played
socket.on('current round', function(receivedData) {
    gameType = receivedData.game_type;
    mainPlayer = receivedData.main_player;
    displayTalonInfoMessage(mainPlayer, gameType);
    displayTalonOptions(mainPlayer);
});
