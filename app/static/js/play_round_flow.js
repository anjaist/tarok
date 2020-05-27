/*
    This file contains the gameplay for each round, from when the talon has been collected and options called
    to when the last user plays their last card.
*/

let isRoundFinished = false;


// displays chosen card on "the table" (middle of the screen) for all users to see
function displayCardOnTable(cardName) {
    console.log(`card to display: ${cardName}`)
    // TODO: start here JS
}


/*
    Cards from the user's hand: highlight cards that can be clicked on (based on what is already on the table).
    When a card is clicked, it is played.
*/
function highlightCardsThatCanBePlayed(canBePlayedCards) {
    let isCardPlayed = false;

    if (!isCardPlayed) {
        for (let i = 1; i <= canBePlayedCards.length; i++) {
            (function(i) {
                let userCard = document.getElementById('user-card-' + i);
                let userCardBg = document.getElementById('user-card-bg-' + i);
                let cardName = getCardName(userCard);

                if (canBePlayedCards.includes(cardName)) {
                    userCard.onmouseover = function() {
                        highlightCard(userCard, userCardBg);
                    };
                    userCard.onmouseout = function() {
                        removeHighlightCard(userCard, userCardBg);
                    };

                    // when the user clicks on a card, that card is played
                    userCard.addEventListener('click', function() {
                        displayCardOnTable(cardName);
                        isCardPlayed = true;
                    })
                }
            })(i);
        }
    }
}


// describes one player's one turn. Involves playing choosing a card from their hand and playing it.
function oneTurn(playerName, canBePlayedCards) {
    highlightCardsThatCanBePlayed(canBePlayedCards);

    // todo display chosen card on table

    // todo remove played card from player's hand

    // todo: socket send to server - chosen card, playerName
    let tempCard = 'temp-card'
    socket.emit('gameplay for round', gameId, playerName, tempCard);
}


// loop for a whole round - breaks when every player has played their last card
socket.on('gameplay for round', function(receivedData) {
    whoseTurn = receivedData.whose_turn;
    isRoundFinished = receivedData.is_round_finished;
    canBePlayedCards = receivedData.can_be_played;

    if (!isRoundFinished) {
        // todo update info: whose turn is it

        oneTurn(whoseTurn, canBePlayedCards);

        // todo if three cards on the table, they should disappear and whose turn display should be updated

        // todo: pile of cards (cards back) should have a number on it, displaying how many cards have been taken
        // that number should be updated when cards are added to it
    }
})


// get a message when calling of options has been completed - starts the round gameplay
socket.on('round call options', function(receivedData) {
    whoseTurn = receivedData.whose_turn;
    canBePlayedCards = receivedData.can_be_played;

    callConfirmed = true;
    displayInfo(mainPlayer, gameType, calledSelectedOptions, whoseTurn);
    oneTurn(whoseTurn, canBePlayedCards);
})
