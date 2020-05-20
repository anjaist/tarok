/*
    This file contains the functionality for the showing and choosing of talon cards
*/

let gameTypeTranslation = {'three': 'tri', 'two': 'dve', 'one': 'ena', 'pass': 'naprej'}
let enumeratedGameType = {'three': 3, 'two': 2, 'one': 1, 'pass': 0}
let gameType = null;
let talonChosen = [];
let talonConfirmed = false;
let userCardsChosen = [];
let userCardsConfirmed = false;

let confirmButton = document.getElementById('confirm-btn');
baseUrlImg = document.getElementById('base-url-for-img').content;


// get card name from file name
function getCardName(fileName) {
    cardName = fileName.src.split('/').pop();
    cardName = cardName.replace('.png', '');
    return cardName
}

// highlight a card that can be clicked on
function highlightCard(cardElement, cardBgElement, highlightColor='green') {
    cardElement.style.opacity = '0.6';
    if (cardBgElement.style.background != 'yellow') {
        cardBgElement.style.background = highlightColor;
    }
}


/*
    Removes highlight from card if the card is green; if the card is yellow,
    the highlight can be removed only by setting removeChosen to true.
*/
function removeHighlightCard(cardElement, cardBgElement, removeChosen=false) {
    if (removeChosen) {
        cardElement.style.opacity = '1';
        cardBgElement.style.background = null;
    } else if (cardBgElement.style.background == 'green') {
        cardElement.style.opacity = '1';
        cardBgElement.style.background = null;
    }
}


/*
    The user chooses the talon cards by clicking on them and "unchooses" by clicking again.
    Only one group of cards (grouped by one, two or three) can be chosen at once.
 */
function chooseTalonCards(listenerCard, listenerCardBg, card2=false, card2bg=false, card3=false, card3bg=false) {
    if (!talonChosen.length) {
        talonChosen.push(getCardName(listenerCard));
        highlightCard(listenerCard, listenerCardBg, 'yellow');
        if (card2) {
            highlightCard(card2, card2bg, 'yellow');
            talonChosen.push(getCardName(card2));
        }
        if (card3) {
            highlightCard(card3, card3bg, 'yellow');
            talonChosen.push(getCardName(card3));
        }

        confirmButton.classList.remove('btn-greyedout');
        confirmButton.classList.add('btn-dark');
    }
    else {
        // remove ALL yellow highlights if unchoosing
        for (let i = 1; i <= 6; i++) {
            let talonCard = document.getElementById('talon-card-img-' + i);
            let talonCardBg = document.getElementById('talon-card-bg-' + i);

            removeHighlightCard(talonCard, talonCardBg, true);
        }
        talonChosen = [];
        confirmButton.classList.remove('btn-dark');
        confirmButton.classList.add('btn-greyedout');
    }
}


/*
    The user chooses individual cards from their hand.
    Depending on the game they are playing, one, two or three cards can be chosen at once.
*/
function chooseCardsFromHand(card, cardBg) {
    cardName = getCardName(card);

    // the limit of chosen cards has not been reached and the card clicked on is not already chosen
    if (userCardsChosen.length < enumeratedGameType[gameType] && !userCardsChosen.includes(cardName)) {
        userCardsChosen.push(cardName);
        highlightCard(card, cardBg, 'yellow');

        // user can confirm chosen cards once they have chose the expected number of them (1, 2 or 3)
        if (userCardsChosen.length == enumeratedGameType[gameType]) {
            confirmButton.classList.remove('btn-greyedout');
            confirmButton.classList.add('btn-dark');
        }

    // card is already yellow and should get "unchosen"
    } else if (userCardsChosen.includes(cardName)) {
        removeHighlightCard(card, cardBg, true);
        userCardsChosen = userCardsChosen.filter(function(cardValue) {return cardValue != cardName});

        confirmButton.classList.remove('btn-dark');
        confirmButton.classList.add('btn-greyedout');
    }
}


function displayTalonOptions(playerName) {
    if (isTalonShown && currentUser == playerName) {
        if (gameType == 'one') {
            // look for a user's mouse movements over talon cards
            for (let i = 1; i <= 6; i++) {
                (function(i) {
                    let talonCard = document.getElementById('talon-card-img-' + i);
                    let talonCardBg = document.getElementById('talon-card-bg-' + i);

                    talonCard.onmouseover = function() {
                        highlightCard(talonCard, talonCardBg);
                    };
                    talonCard.onmouseout = function() {
                        removeHighlightCard(talonCard, talonCardBg);
                    }

                    // Listen for a user's click on talon cards
                    talonCard.addEventListener('click', function() {
                        chooseTalonCards(talonCard, talonCardBg)
                    })
                })(i);
            }

        } else if (gameType == 'two') {
            // define how cards should be grouped (by two)
            let talonCardPairs = {'1': '2', '2': '1',
                                  '3': '4', '4': '3',
                                  '5': '6', '6': '5'}

            for (let i = 1; i <= 6; i++) {
                (function(i) {
                    // define main card (clicked on or mouseovered) and its associated card
                    let talonCard = document.getElementById('talon-card-img-' + i);
                    let talonCardBg = document.getElementById('talon-card-bg-' + i);
                    let pairedCard = document.getElementById('talon-card-img-' + talonCardPairs[i]);
                    let pairedCardBg = document.getElementById('talon-card-bg-' + talonCardPairs[i]);

                    // look for a user's mouse movements over talon cards
                    talonCard.onmouseover = function() {
                        highlightCard(talonCard, talonCardBg);
                        highlightCard(pairedCard, pairedCardBg);
                    };
                    talonCard.onmouseout = function() {
                        removeHighlightCard(talonCard, talonCardBg);
                        removeHighlightCard(pairedCard, pairedCardBg);
                    }

                    // Listen for a user's click on talon cards
                    talonCard.addEventListener('click', function() {
                        chooseTalonCards(talonCard, talonCardBg, pairedCard, pairedCardBg)
                    })
                })(i);
            }

        } else if (gameType == 'three') {
            // define how cards should be grouped (by three)
            let talonCardPairs = {'1': ['2', '3'], '2': ['1', '3'], '3': ['1', '2'],
                                  '4': ['5', '6'], '5': ['4', '6'], '6': ['4', '5']}

            for (let i = 1; i <= 6; i++) {
                (function(i) {
                    // define main card (clicked on or mouseovered) and its two associated cards
                    let talonCard = document.getElementById('talon-card-img-' + i);
                    let talonCardBg = document.getElementById('talon-card-bg-' + i);
                    let pairedCard1 = document.getElementById('talon-card-img-' + talonCardPairs[i][0]);
                    let pairedCard1Bg = document.getElementById('talon-card-bg-' + talonCardPairs[i][0]);
                    let pairedCard2 = document.getElementById('talon-card-img-' + talonCardPairs[i][1]);
                    let pairedCard2Bg = document.getElementById('talon-card-bg-' + talonCardPairs[i][1]);

                    // look for a user's mouse movements over talon cards
                    talonCard.onmouseover = function() {
                        highlightCard(talonCard, talonCardBg);
                        highlightCard(pairedCard1, pairedCard1Bg);
                        highlightCard(pairedCard2, pairedCard2Bg);
                    };
                    talonCard.onmouseout = function() {
                        removeHighlightCard(talonCard, talonCardBg);
                        removeHighlightCard(pairedCard1, pairedCard1Bg);
                        removeHighlightCard(pairedCard2, pairedCard2Bg);
                    }

                    // Listen for a user's click on talon cards
                    talonCard.addEventListener('click', function() {
                        chooseTalonCards(talonCard, talonCardBg, pairedCard1, pairedCard1Bg, pairedCard2, pairedCard2Bg)
                    })
                })(i);
            }
        }
    }
}

let talonInfoDiv = document.getElementById('talon-info');

// display an info message about talon. The message is different for the main player
function displayTalonInfoMessage(mainPlayer) {
    if (currentUser == mainPlayer) {
        if (!talonConfirmed) {
            message = 'Izberi karte iz talona';
        } else {
            message = 'Izberi karte za založit';
            confirmButton.classList.remove('btn-dark');
            confirmButton.classList.add('btn-greyedout');
        }
    } else {
        message = `${mainPlayer} načrtuje igro "${gameTypeTranslation[gameType]}"...`;
        confirmButton.style.display = 'none';
    }
    talonInfoDiv.innerHTML = message;

    // listen to clicks on the "confirm" button
    confirmButton.addEventListener('click', function() {
        if (!talonConfirmed && currentUser == mainPlayer) {
            talonConfirmed = true;

            let talonCardsFront = document.getElementById('talon-front-cards');
            talonCardsFront.innerHTML = null;
            socket.emit('update players hand', mainPlayer, gameId, talonChosen, null);

        } else if (talonConfirmed && !userCardsConfirmed && currentUser == mainPlayer) {
            userCardsConfirmed = true;
            socket.emit('update players hand', mainPlayer, gameId, null, userCardsChosen);
        }
    })

    // remove info message and "confirm" button once card swap is finished
    if (userCardsConfirmed) {
        document.getElementById('talon-front').style.display = 'none';
    }
}


// cards from the user's hand: highlight cards that can be clicked on
function displayCardsToSwap(mainPlayer) {

    let numberOfCards = 16 + enumeratedGameType[gameType]

    for (let i = 1; i <= numberOfCards; i++) {
        (function(i) {
            let userCard = document.getElementById('user-card-' + i);
            let userCardBg = document.getElementById('user-card-bg-' + i);
            userCard.onmouseover = function() {
                highlightCard(userCard, userCardBg);
            };
            userCard.onmouseout = function() {
            removeHighlightCard(userCard, userCardBg);
            };

            // Listen for a user's click on their cards
            userCard.addEventListener('click', function() {
                chooseCardsFromHand(userCard, userCardBg);
            })
        })(i);
    };
}


// re-render the main player's hand to show the additions from talon
function displayUpdatedHand(updatedHand) {
    let cardsWrapper = document.getElementById('cards-wrapper-bottom');
    cardsWrapper.innerHTML = null;

    for (let [i, card] of updatedHand.entries()) {

        // create the container/bg element for each card
        let cardContainer = document.createElement('div');
        cardContainer.classList.add('card-cont');
        cardContainer.id = `user-card-bg-${i+1}`;
        cardsWrapper.appendChild(cardContainer);

        // create the img tag for each card
        let imgTag = document.createElement('img');
        imgTag.classList.add('tarok-card');
        imgTag.id = `user-card-${i+1}`;
        imgTag.src = baseUrlImg + card + '.png';
        cardContainer.appendChild(imgTag);
    }
}


// get information on the current round being played
socket.on('round begins', function(receivedData) {
    gameType = receivedData.game_type;
    mainPlayer = receivedData.main_player;
    displayTalonInfoMessage(mainPlayer);
    displayTalonOptions(mainPlayer);
});


// get a player's updated hand with added talon cards
socket.on('update players hand', function(receivedData) {
    mainPlayer = receivedData.main_player;
    updatedHand = receivedData.updated_hand;
    userCardsConfirmed = receivedData.swap_finished;

    displayTalonInfoMessage(mainPlayer);
    if (mainPlayer == currentUser) {
        displayUpdatedHand(updatedHand);
        displayCardsToSwap(mainPlayer);
    }
});
