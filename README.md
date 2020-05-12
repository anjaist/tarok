This app is currently a work in progress.

Redis entry example:
```
KEY name => game_id:round_choices
{
  "player1_chosen": "one",
  "player1_options": "pass,one",
  "player2_chosen": "pass",
  "player2_options": "chosen",
  "player3_chosen": "one",
  "player3_options": "pass,one",
  "order": "player1,player2,player3",
  "new_order": "player2,player3,player1"
}
```
key             | value                                                     | 
--------------- | --------------------------------------------------------- | 
order           | order of players as established at the beginning of choosing game
new_order       | order, as updated based on players being able to choose again (their name is appended to the end)
playerX_chosen  | choice playerX has already made
playerX_options | options playerX can choose from

```
KEY name => game_id:current_round
{
  "type": "pass/three/two",
  "player_order": "player1,player2,player3",
  "main_player": "player1",
  "whose_turn": "player2"
}
```
key          | value                                                     | 
------------ | --------------------------------------------------------- | 
type         | type of game the `main_player` is playing
player_order | the order the players set down their cards. This order is fixed for the lifetime of the game (all rounds)
main_player  | player who is currently playing the game. If "klop/pass", this field is set to null
whose_turn   | player, whose turn to set down a card it is currently
