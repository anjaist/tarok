/*
    This file contains the gameplay for each round, from when the talon has been collected and options called
    to when the last user plays their last card.
*/

let isRoundFinished = false;


// checks which card div needs to be activated
function getCardOnTableNumber() {
    let onTableCard1 = document.getElementById('card-on-table-1');
    let onTableCard2 = document.getElementById('card-on-table-2');

    if (onTableCard1.style.display == 'block') {
        if (onTableCard2.style.display == 'block') {
            return '3'
        }
        return '2'
    }
    return '1'
}


// displays chosen card on "the table" (middle of the screen) for all users to see
function displayCardOnTable(cardName) {
    let onTableCard = document.getElementById('card-on-table-' + getCardOnTableNumber());
    onTableCard.src = baseUrlImg + cardName + '.png';
    onTableCard.style.display = 'block';
}


/*
    Describes one player's one turn.
    Cards from the user's hand: highlight cards that can be clicked on (based on what is already on the table).
    When a card is clicked, it is played.
*/
function oneTurn(playerName, canBePlayedCards, playersHand) {

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

                    // remove played card from hand and re-render the display of user's hand
                    let updatedPlayersHand = playersHand.filter(function(card) { return card != cardName })
                    displayUpdatedHand(updatedPlayersHand);

                    // display the played card in the middle of the screen
                    displayCardOnTable(cardName);

                    // send information about the played card to server side
                    console.log(`[SENDING] card chosen by ${playerName}: ${cardName}`)
                    socket.emit('gameplay for round', gameId, playerName, cardName);
                })
            }
        })(i);
    }
}


// loop for a whole round - breaks when every player has played their last card
socket.on('gameplay for round', function(receivedData) {
    whoseTurn = receivedData.whose_turn;
    isRoundFinished = receivedData.is_round_finished;
    canBePlayedCards = receivedData.can_be_played;
    playersHand = receivedData.players_hand;

    if (!isRoundFinished) {
        // todo update info: whose turn is it -> should be visible to all windows

        oneTurn(whoseTurn, canBePlayedCards, playersHand);

        // todo if three cards on the table, they should disappear and whose turn display should be updated

        // todo: pile of cards (cards back) should have a number on it, displaying how many cards have been taken
        // that number should be updated when cards are added to it
    }
})


// get a message when calling of options has been completed - starts the round gameplay
socket.on('round call options', function(receivedData) {
    whoseTurn = receivedData.whose_turn;
    canBePlayedCards = receivedData.can_be_played;
    playersHand = receivedData.players_hand;

    callConfirmed = true;
    displayInfo(mainPlayer, gameType, calledSelectedOptions, whoseTurn);
    oneTurn(whoseTurn, canBePlayedCards, playersHand);
})
