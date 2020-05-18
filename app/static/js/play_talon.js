/*
    This file contains the functionality for the showing and choosing of talon cards
*/

let gameTypeTranslation = {'three': 'tri', 'two': 'dve', 'one': 'ena', 'pass': 'naprej'}
let gameType = null;

// talon cards
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


// highlight a card that can be clicked on
function highlightCard(cardElement, cardBgElement, highlightColor='green') {
    cardElement.style.opacity = '0.6';
    if (cardBgElement.style.background != 'yellow') {
        cardBgElement.style.background = highlightColor;
    }
}


/* Removes highlight from card if the cards is green; if the card is yellow,
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
        removeHighlightCard(talonCard1, talonCardBg1, true);
        removeHighlightCard(talonCard2, talonCardBg2, true);
        removeHighlightCard(talonCard3, talonCardBg3, true);
        removeHighlightCard(talonCard4, talonCardBg4, true);
        removeHighlightCard(talonCard5, talonCardBg5, true);
        removeHighlightCard(talonCard6, talonCardBg6, true);
        talonChosen = [];
    }
}


function displayTalonOptions(playerName) {
    if (isTalonShown && currentUser == playerName) {
        if (gameType == 'one') {
            // look for a user's mouse movements over talon cards
            talonCard1.onmouseover = function(event) {
                highlightCard(talonCard1, talonCardBg1);
            }
            talonCard1.onmouseout = function(event) {
                removeHighlightCard(talonCard1, talonCardBg1);
            }
            talonCard2.onmouseover = function(event) {
                highlightCard(talonCard2, talonCardBg2);
            }
            talonCard2.onmouseout = function(event) {
                removeHighlightCard(talonCard2, talonCardBg2);
            }
            talonCard3.onmouseover = function(event) {
                highlightCard(talonCard3, talonCardBg3);
            }
            talonCard3.onmouseout = function(event) {
                removeHighlightCard(talonCard3, talonCardBg3);
            }
            talonCard4.onmouseover = function(event) {
                highlightCard(talonCard4, talonCardBg4);
            }
            talonCard4.onmouseout = function(event) {
                removeHighlightCard(talonCard4, talonCardBg4);
            }
            talonCard5.onmouseover = function(event) {
                highlightCard(talonCard5, talonCardBg5);
            }
            talonCard5.onmouseout = function(event) {
                removeHighlightCard(talonCard5, talonCardBg5);
            }
            talonCard6.onmouseover = function(event) {
                highlightCard(talonCard6, talonCardBg6);
            }
            talonCard6.onmouseout = function(event) {
                removeHighlightCard(talonCard6, talonCardBg6);
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
                highlightCard(talonCard1, talonCardBg1);
                highlightCard(talonCard2, talonCardBg2);
            }
            talonCard1.onmouseout = function(event) {
                removeHighlightCard(talonCard1, talonCardBg1);
                removeHighlightCard(talonCard2, talonCardBg2);
            }
            talonCard2.onmouseover = function(event) {
                highlightCard(talonCard1, talonCardBg1);
                highlightCard(talonCard2, talonCardBg2);
            }
            talonCard2.onmouseout = function(event) {
                removeHighlightCard(talonCard1, talonCardBg1);
                removeHighlightCard(talonCard2, talonCardBg2);
            }
            talonCard3.onmouseover = function(event) {
                highlightCard(talonCard3, talonCardBg3);
                highlightCard(talonCard4, talonCardBg4);
            }
            talonCard3.onmouseout = function(event) {
                removeHighlightCard(talonCard3, talonCardBg3);
                removeHighlightCard(talonCard4, talonCardBg4);
            }
            talonCard4.onmouseover = function(event) {
                highlightCard(talonCard3, talonCardBg3);
                highlightCard(talonCard4, talonCardBg4);
            }
            talonCard4.onmouseout = function(event) {
                removeHighlightCard(talonCard3, talonCardBg3);
                removeHighlightCard(talonCard4, talonCardBg4);
            }
            talonCard5.onmouseover = function(event) {
                highlightCard(talonCard5, talonCardBg5);
                highlightCard(talonCard6, talonCardBg6);
            }
            talonCard5.onmouseout = function(event) {
                removeHighlightCard(talonCard5, talonCardBg5);
                removeHighlightCard(talonCard6, talonCardBg6);
            }
            talonCard6.onmouseover = function(event) {
                highlightCard(talonCard5, talonCardBg5);
                highlightCard(talonCard6, talonCardBg6);
            }
            talonCard6.onmouseout = function(event) {
                removeHighlightCard(talonCard5, talonCardBg5);
                removeHighlightCard(talonCard6, talonCardBg6);
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
                highlightCard(talonCard1, talonCardBg1);
                highlightCard(talonCard2, talonCardBg2);
                highlightCard(talonCard3, talonCardBg3);
            }
            talonCard1.onmouseout = function(event) {
                removeHighlightCard(talonCard1, talonCardBg1);
                removeHighlightCard(talonCard2, talonCardBg2);
                removeHighlightCard(talonCard3, talonCardBg3);
            }
            talonCard2.onmouseover = function(event) {
                highlightCard(talonCard1, talonCardBg1);
                highlightCard(talonCard2, talonCardBg2);
                highlightCard(talonCard3, talonCardBg3);
            }
            talonCard2.onmouseout = function(event) {
                removeHighlightCard(talonCard1, talonCardBg1);
                removeHighlightCard(talonCard2, talonCardBg2);
                removeHighlightCard(talonCard3, talonCardBg3);
            }
            talonCard3.onmouseover = function(event) {
                highlightCard(talonCard1, talonCardBg1);
                highlightCard(talonCard2, talonCardBg2);
                highlightCard(talonCard3, talonCardBg3);
            }
            talonCard3.onmouseout = function(event) {
                removeHighlightCard(talonCard1, talonCardBg1);
                removeHighlightCard(talonCard2, talonCardBg2);
                removeHighlightCard(talonCard3, talonCardBg3);
            }
            talonCard4.onmouseover = function(event) {
                highlightCard(talonCard4, talonCardBg4);
                highlightCard(talonCard5, talonCardBg5);
                highlightCard(talonCard6, talonCardBg6);
            }
            talonCard4.onmouseout = function(event) {
                removeHighlightCard(talonCard4, talonCardBg4);
                removeHighlightCard(talonCard5, talonCardBg5);
                removeHighlightCard(talonCard6, talonCardBg6);
            }
            talonCard5.onmouseover = function(event) {
                highlightCard(talonCard4, talonCardBg4);
                highlightCard(talonCard5, talonCardBg5);
                highlightCard(talonCard6, talonCardBg6);
            }
            talonCard5.onmouseout = function(event) {
                removeHighlightCard(talonCard4, talonCardBg4);
                removeHighlightCard(talonCard5, talonCardBg5);
                removeHighlightCard(talonCard6, talonCardBg6);
            }
            talonCard6.onmouseover = function(event) {
                highlightCard(talonCard4, talonCardBg4);
                highlightCard(talonCard5, talonCardBg5);
                highlightCard(talonCard6, talonCardBg6);
            }
            talonCard6.onmouseout = function(event) {
                removeHighlightCard(talonCard4, talonCardBg4);
                removeHighlightCard(talonCard5, talonCardBg5);
                removeHighlightCard(talonCard6, talonCardBg6);
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


// cards from the user's hand: highlight cards that can be clicked on
for (let i = 1; i <= 16; i++) {
    (function(i) {
        let userCard = document.getElementById("user-card-" + i);
        let userCardBg = document.getElementById("user-card-bg-" + i);
        userCard.onmouseover = function() {
            highlightCard(userCard, userCardBg);
        };
        userCard.onmouseout = function() {
        removeHighlightCard(userCard, userCardBg);
        };
    })(i);
}


// get information on the current round being played
socket.on('current round', function(receivedData) {
    gameType = receivedData.game_type;
    mainPlayer = receivedData.main_player;
    displayTalonInfoMessage(mainPlayer);
    displayTalonOptions(mainPlayer);
});
