/*
    This file contains the gameplay for each round, from when the talon has been collected and options called
    to when the last user plays their last card.
*/

let isRoundFinished = false;


// describes one player's one turn. Involves playing choosing a card from their hand and playing it.
function oneTurn(playerName) {
    // todo highlight cards for player

    // todo register player's click on card

    // todo display chosen card on table

    // todo: socket send to server - chose card, playerName
}


// loop for a whole round - breaks when every player has played their last card
socket.on('gameplay_for_round', function(receivedData) {
    whoseTurn = receivedData.whose_turn;
    isRoundFinished = receivedData.isRoundFinished
    if (!isRoundFinished) {
        // todo update info: whose turn is it

        oneTurn(whoseTurn);

        // todo if three cards on the table, they should disappear and whose turn display should be updated
    }
})


// get a message when calling of options has been completed - starts the round gameplay
socket.on('round call options', function() {
    callConfirmed = true;
    displayInfo(mainPlayer, gameType, calledSelectedOptions, whoseTurn);
    oneTurn(whoseTurn);
})
