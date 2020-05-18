/*
    This file contains the functionality for the showing and choosing of talon cards
*/

let gameTypeTranslation = {'three': 'tri', 'two': 'dve', 'one': 'ena', 'pass': 'naprej'}

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
let talonChosen = [];


// highlight available talon cards grouped according to the type of game played
function highlightTalonCard(cardElement, cardBgElement, highlightColor='green') {
    cardElement.style.opacity = '0.6';
    if (cardBgElement.style.background != 'yellow') {
        cardBgElement.style.background = highlightColor;
    }
}


/* Removes highlight from card if the cards is green; if the card is yellow,
   the highlight can be removed only by setting removeChose to true.
*/
function removeHighlightTalonCard(cardElement, cardBgElement, removeChosen=false) {
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
        highlightTalonCard(listenerCard, listenerCardBg, 'yellow');
        if (card2) highlightTalonCard(card2, card2bg, 'yellow');
        if (card3) highlightTalonCard(card3, card3bg, 'yellow');
    }
    else {
        // remove ALL yellow highlights if unchoosing
        removeHighlightTalonCard(talonCard1, talonCardBg1, true);
        removeHighlightTalonCard(talonCard2, talonCardBg2, true);
        removeHighlightTalonCard(talonCard3, talonCardBg3, true);
        removeHighlightTalonCard(talonCard4, talonCardBg4, true);
        removeHighlightTalonCard(talonCard5, talonCardBg5, true);
        removeHighlightTalonCard(talonCard6, talonCardBg6, true);
        talonChosen = [];
    }
}


function displayTalonOptions(playerName) {
    if (isTalonShown && currentUser == playerName) {
        if (gameType == 'one') {
            // look for a user's mouse movements over talon cards
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

            // Listen for a user's click on talon cards.
            talonCard1.addEventListener('click', function() {
                chooseTalonCards(talonCard1, talonCardBg1);
            })
            talonCard2.addEventListener('click', function() {
                chooseTalonCards(talonCard2, talonCardBg2);
            })
            talonCard3.addEventListener('click', function() {
                chooseTalonCards(talonCard3, talonCardBg3);
            })
            talonCard4.addEventListener('click', function() {
                chooseTalonCards(talonCard4, talonCardBg4);
            })
            talonCard5.addEventListener('click', function() {
                chooseTalonCards(talonCard5, talonCardBg5);
            })
            talonCard6.addEventListener('click', function() {
                chooseTalonCards(talonCard6, talonCardBg6);
            })

        } else if (gameType == 'two') {
            // look for a user's mouse movements over talon cards
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

            // Listen for a user's click on talon cards
            talonCard1.addEventListener('click', function() {
                chooseTalonCards(talonCard1, talonCardBg1, talonCard2, talonCardBg2);
            })
            talonCard2.addEventListener('click', function() {
                chooseTalonCards(talonCard1, talonCardBg1, talonCard2, talonCardBg2);
            })
            talonCard3.addEventListener('click', function() {
                chooseTalonCards(talonCard3, talonCardBg3, talonCard4, talonCardBg4);
            })
            talonCard4.addEventListener('click', function() {
                chooseTalonCards(talonCard3, talonCardBg3, talonCard4, talonCardBg4);
            })
            talonCard5.addEventListener('click', function() {
                chooseTalonCards(talonCard5, talonCardBg5, talonCard6, talonCardBg6);
            })
            talonCard6.addEventListener('click', function() {
                chooseTalonCards(talonCard5, talonCardBg5, talonCard6, talonCardBg6);
            })

        } else if (gameType == 'three') {
            // look for a user's mouse movements over talon cards
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

            // Listen for a user's click on talon cards.
            talonCard1.addEventListener('click', function() {
                chooseTalonCards(talonCard1, talonCardBg1, talonCard2, talonCardBg2, talonCard3, talonCardBg3);
            })
            talonCard2.addEventListener('click', function() {
                chooseTalonCards(talonCard1, talonCardBg1, talonCard2, talonCardBg2, talonCard3, talonCardBg3);
            })
            talonCard3.addEventListener('click', function() {
                chooseTalonCards(talonCard1, talonCardBg1, talonCard2, talonCardBg2, talonCard3, talonCardBg3);
            })
            talonCard4.addEventListener('click', function() {
                chooseTalonCards(talonCard4, talonCardBg4, talonCard5, talonCardBg5, talonCard6, talonCardBg6);
            })
            talonCard5.addEventListener('click', function() {
                chooseTalonCards(talonCard4, talonCardBg4, talonCard5, talonCardBg5, talonCard6, talonCardBg6);
            })
            talonCard6.addEventListener('click', function() {
                chooseTalonCards(talonCard4, talonCardBg4, talonCard5, talonCardBg5, talonCard6, talonCardBg6);
            })
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


// get information on the current round being played
socket.on('current round', function(receivedData) {
    gameType = receivedData.game_type;
    mainPlayer = receivedData.main_player;
    displayTalonInfoMessage(mainPlayer);
    displayTalonOptions(mainPlayer);
});
