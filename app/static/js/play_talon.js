/*
    This file contains the functionality for the showing and choosing of talon cards
*/

let gameTypeTranslation = {'three': 'tri', 'two': 'dve', 'one': 'ena', 'pass': 'naprej'}
let gameType = null;
let talonChosen = [];


// highlight a card that can be clicked on
function highlightCard(cardElement, cardBgElement, highlightColor='green') {
    cardElement.style.opacity = '0.6';
    if (cardBgElement.style.background != 'yellow') {
        cardBgElement.style.background = highlightColor;
    }
}


/* Removes highlight from card if the card is green; if the card is yellow,
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


// the user chooses the talon cards by clicking on them and "unchooses" by clicking again
function chooseTalonCards(listenerCard, listenerCardBg, card2=false, card2bg=false, card3=false, card3bg=false) {
    if (!talonChosen.length) {
        let cardFileName = listenerCard.src.split('/').pop();
        cardFileName = cardFileName.replace('.png', '');
        talonChosen.push(cardFileName);
        highlightCard(listenerCard, listenerCardBg, 'yellow');
        if (card2) highlightCard(card2, card2bg, 'yellow');
        if (card3) highlightCard(card3, card3bg, 'yellow');
    }
    else {
        // remove ALL yellow highlights if unchoosing
        for (let i = 1; i <= 6; i++) {
            let talonCard = document.getElementById('talon-card-img-' + i);
            let talonCardBg = document.getElementById('talon-card-bg-' + i);

            removeHighlightCard(talonCard, talonCardBg, true);
        }
        talonChosen = [];
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
        message = 'Izberi karte iz talona in karte iz roke za zamenjavo'
    } else {
        message = `${mainPlayer} načrtuje igro "${gameTypeTranslation[gameType]}"...`
    }
    talonInfoDiv.innerHTML = message;
}


// cards from the user's hand: highlight cards that can be clicked on
function displayCardsToSwap(mainPlayer) {
    if (isTalonShown && currentUser == mainPlayer) {
        for (let i = 1; i <= 16; i++) {
            (function(i) {
                let userCard = document.getElementById('user-card-' + i);
                let userCardBg = document.getElementById('user-card-bg-' + i);
                userCard.onmouseover = function() {
                    highlightCard(userCard, userCardBg);
                };
                userCard.onmouseout = function() {
                removeHighlightCard(userCard, userCardBg);
                };
            })(i);
        };
    }
}

// get information on the current round being played
socket.on('current round', function(receivedData) {
    gameType = receivedData.game_type;
    mainPlayer = receivedData.main_player;
    displayTalonInfoMessage(mainPlayer);
    displayTalonOptions(mainPlayer);
    displayCardsToSwap(mainPlayer);
});
