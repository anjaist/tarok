/*
    This file contains the gameplay for each round, from when the talon has been collected and options called
    to when the last user plays their last card.
*/

let isRoundFinished = false;
let onTableCard1 = document.getElementById('card-on-table-1');
let onTableCard2 = document.getElementById('card-on-table-2');
let onTableCard3 = document.getElementById('card-on-table-3');
let onTable = document.getElementById('on-table').content;
onTable = onTable != "" ? onTable.split(',') : [];


// checks which card div needs to be activated
function getCardOnTableNumber() {
    if (onTableCard1.style.display == 'block') {
        if (onTableCard2.style.display == 'block') {
            return '3'
        }
        return '2'
    }
    return '1'
}


// hides all cards on table (clears table)
function hideOnTable() {
    onTableCard1.style.display = 'none';
    onTableCard2.style.display = 'none';
    onTableCard3.style.display = 'none';
}


// displays all cards on table for all users
function displayOnTable(onTable) {
    hideOnTable();
    onTable.forEach(function(card) {
        displayNewCardOnTable(card);
    });
}
displayOnTable(onTable);


// displays newly chosen card on "the table" (middle of the screen) for all users to see
function displayNewCardOnTable(cardName) {
    let onTableCard = document.getElementById('card-on-table-' + getCardOnTableNumber());
    onTableCard.src = baseUrlImg + cardName + '.png';
    onTableCard.style.display = 'block';
}


/*
    Describes one player's one turn.
    Cards from the user's hand: highlight cards that can be clicked on (based on what is already on the table).
    When a card is clicked, it is played.
    If 3 cards are on the table, they will disappear when a user chooses another card (the first one of the new round)
*/
function oneTurn(playerName, canBePlayedCards, playersHand, onTable) {

    // for non-current users, the handSize is one card smaller, as they may have already played a card.
    // this variable exists to avoid spammy error messages in JS console for players that are not currently choosing
    let handSize = playerName == currentUser ? playersHand.length : playersHand.length - 1

    for (let i = 1; i <= handSize; i++) {
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
                    // remove all cards from table if there are already 3 cards on it
                    if (onTable.length == 3) {
                        hideOnTable(onTable);
                        onTable = []
                    }

                    // remove played card from hand and re-render the display of user's hand
                    let updatedPlayersHand = playersHand.filter(function(card) { return card != cardName })
                    displayUpdatedHand(updatedPlayersHand);

                    // display the played card in the middle of the screen
                    displayNewCardOnTable(cardName);

                    // send information about the played card to server side
                    console.log(`[SENDING] card chosen by ${playerName}: ${cardName}`)
                    socket.emit('gameplay for round', gameId, playerName, cardName);
                })
            }
        })(i);
    }
}
// on page reload, the information to display is asked of server side
if (callConfirmed && !isRoundFinished) {
    console.log(`[SENDING] The page was reloaded. No card was played. Asking server side for data...`)
    socket.emit('gameplay for round', gameId, currentUser, null);
}


// one round - finishes when every player has played their last card
socket.on('gameplay for round', function(receivedData) {
    whoseTurn = receivedData.whose_turn;
    isRoundFinished = receivedData.is_round_finished;
    canBePlayedCards = receivedData.can_be_played;
    playersHand = receivedData.players_hand;
    onTable = receivedData.on_table;

    if (!isRoundFinished) {
        displayInfo(mainPlayer, gameType, calledSelectedOptions, whoseTurn);
        oneTurn(whoseTurn, canBePlayedCards, playersHand, onTable);
    }
    displayOnTable(onTable);

    if (isRoundFinished) {
        console.log('The round is finished. Sending request for score calculation...');
        socket.emit('calculate score', gameId, currentUser);
    }
})


// get a message when calling of options has been completed - starts the round gameplay
socket.on('round call options', function(receivedData) {
    whoseTurn = receivedData.whose_turn;
    canBePlayedCards = receivedData.can_be_played;
    playersHand = receivedData.players_hand;
    calledSelectedOptions = receivedData.called;
    onTable = [];

    callConfirmed = true;
    displayInfo(mainPlayer, gameType, calledSelectedOptions, whoseTurn);
    oneTurn(whoseTurn, canBePlayedCards, playersHand, onTable);
})


// display a breakdown of how the final score was calculated for the round
function showScoreCalculation(receivedScoreData) {
    let countedCards = receivedScoreData.counted_cards;
    let calledCalculation = receivedScoreData.called_calculation;
    let extrasCalculation = receivedScoreData.extras_calculation;
    let finalCalculation = receivedScoreData.final_calculation;
    let gameWorth = receivedScoreData.game_worth;
    let pointsDifference= receivedScoreData.points_difference;

    document.getElementById('info-calculation').style.display = 'flex';
    document.getElementById('points-main-player').innerText = mainPlayer;
    document.getElementById('points-count').innerText = countedCards;
    document.getElementById('points-total').innerText = finalCalculation;
    document.getElementById('points-game-type').innerText = gameWorth;
    document.getElementById('points-difference').innerText = pointsDifference;

    // display score value for each called element
    calledScore = document.getElementById('points-called');
    for (let key in calledCalculation) {
        let htmlToInsert = `<p class="points-number">${key}: ${calledCalculation[key]}</p>`
        if (!calledScore.innerHTML.includes(htmlToInsert)) {
            calledScore.insertAdjacentHTML('beforeend', htmlToInsert);
        }
    }

    // display score value for each extra element
    extraScore = document.getElementById('points-extra');
    for (let key in extrasCalculation) {
        let htmlToInsert = `<p class="points-number">${key}: ${extrasCalculation[key]}</p>`
        if (!extraScore.innerHTML.includes(htmlToInsert)) {
            extraScore.insertAdjacentHTML('beforeend', htmlToInsert);
        }
    }
}


// receive a message once the score for a round has been calculated
socket.on('calculate score', function(receivedData) {
    // hide round info window and cards on table (from last round)
    document.getElementById('info-game-wrapper').style.display = 'none';
    hideOnTable();

    // show calculation info window
    showScoreCalculation(receivedData);
})
