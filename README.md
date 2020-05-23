# TAROK
This app is currently a work in progress.

## Contents
* [Game Flow](#game-flow)
* [RedisDB](#redisdb)


### Game Flow
Three player game:
1. All users need to be present in the game.
2. Users are dealt 16 cards each and 6 cards are dealt to talon (not seen by users)
3. Cards are dealt and users call which game they want to play.
    Options:
    - `three` (lowest game, worth 10 points, three card can be swapped with cards from talon)
    - `two` (mid-level game, worth 20 points, two card can be swapped with cards from talon)
    - `one` (highest game, worth 30 points, only one card can be swapped with a card from talon)
    - `pass` (the user is not playing a game on their own in this round)
    If all users choose `pass`, a special game is played, called `klop`.
    The first user to pick, must choose `three` but can later change it to `pass` (or a higher game).
4. Once it is clear who is playing what game, the talon is revealed (everyone sees it)
5. The main player swaps their cards with those from talon
(what is taken from talon is seen by everyone but only the main player know what cards they got read of from their hand)
6. The main player calls special attributes of the game they are about to play, where they get `+` points if they manage to do it 
and `-` points if they aren't successful).
    Options:
    - `trula` (The player collects the following tarok cards: I, XXI, XXII)
    - `pagat ultimo` (The player uses tarok I as their last card and takes the sweep)
    - `all 4 kings` (the player collects all 4 kings)
    - `valat` (the player collects all cards)
    - `nothing called`
7. The round begins


### RedisDB

*Round Choices*
```
KEY name => game_id:round_choices
{
  "{username1}_chosen": "one",
  "{username1}_options": "pass,one",
  "{username2}_chosen": "pass",
  "{username2}_options": "chosen",
  "{username3}_chosen": "one",
  "{username3}_options": "pass,one",
  "order": "{username1},{username2},{username3}",
  "new_order": "{username2},{username3},{username1}",
  "last_choice": "false"
}
```
key               | value                                                     | 
----------------- | --------------------------------------------------------- | 
order             | order of players as established at the beginning of choosing game
new_order         | order, as updated based on players being able to choose again (their name is appended to the end)
usernameX_chosen  | choice usernameX has already made
usernameX_options | options usernameX can choose from
last_choice       | string ('false' or 'true'); indicates if the current choice should be the last in the round


*State of Current Round*
```
KEY name => game_id:current_round
{
  "type": "pass/three/two",
  "player_order": "{username1},{username2},{username3}",
  "main_player": "{username1}",
  "whose_turn": "{username2}",
  "{username1}_cards": "card1.jpg,card2.jpg,card3,jpg,{...}",
  "{username2}_cards": "card1.jpg,card2.jpg,card3,jpg,{...}",
  "{username3}_cards": "card1.jpg,card2.jpg,card3,jpg,{...}",
  "talon_cards": "card1.jpg,card2.jpg,card3,jpg,{...}",
  "called": ""
}
```
key             | value                                                     | 
--------------- | --------------------------------------------------------- | 
type            | type of game the `main_player` is playing
player_order    | the order the players set down their cards. This order is fixed for the lifetime of the game (all rounds)
main_player     | player who is currently playing the game. If "klop/pass", this field is set to null
whose_turn      | player, whose turn to set down a card it is currently
usernameX_cards | saves usernameX's cards in current round in a sorted order (based on game sort logic, not python one)
talon_cards     | saves cards in talon in current round in a sorted order (based on game sort logic, not python one)
called          | saves what attributes have been called by main_player for current round. Empty entry means the user has not yet made their call choice
