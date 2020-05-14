This app is currently a work in progress.

Redis entry example:
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
  "new_order": "{username2},{username3},{username1}"
}
```
key               | value                                                     | 
----------------- | --------------------------------------------------------- | 
order             | order of players as established at the beginning of choosing game
new_order         | order, as updated based on players being able to choose again (their name is appended to the end)
usernameX_chosen  | choice usernameX has already made
usernameX_options | options usernameX can choose from

```
KEY name => game_id:current_round
{
  "type": "pass/three/two",
  "player_order": "{username1},{username2},{username3}",
  "main_player": "{username1}",
  "whose_turn": "{username2}"
  "{username1}_cards": "card1.jpg,card2.jpg,card3,jpg,{...}"
  "{username2}_cards": "card1.jpg,card2.jpg,card3,jpg,{...}"
  "{username3}_cards": "card1.jpg,card2.jpg,card3,jpg,{...}"
  "talon_cards": "card1.jpg,card2.jpg,card3,jpg,{...}"
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
