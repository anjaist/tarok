from app.game_utils import deal_new_round, sort_player_cards


def test_deal_new_round():
    """tests that all cards are dealt between players and talon and no one card is dealt twice"""
    all_players = ['a', 'b', 'c']
    
    # check dealing for 3 players
    dealt = deal_new_round(all_players)
    all_dealt_cards = sum(dealt.values(), [])
    assert len(all_dealt_cards) == len(set(all_dealt_cards))
    assert len(dealt['talon']) == 6
    players = list(dealt)
    players.remove('talon')
    assert len(players) == 3
    for player in players:
        assert len(dealt[player]) == 16

    # check that the player's cards are sorted but talon is left unsorted
    for player in players:
        assert dealt[player] == sort_player_cards(dealt[player])
    assert dealt['talon'] != sort_player_cards(dealt['talon'])

    # check dealing for 4 players
    all_players.append('d')
    dealt = deal_new_round(all_players)
    players = list(dealt)
    players.remove('talon')
    assert len(players) == 4
    for player in players:
        assert len(dealt[player]) == 12


def test_sort_player_cards():
    """tests that player's cards are sorted as expected:
    suits desc and taroks asc in order: hearts-spades-taroks-diamonds-clubs"""
    player_cards = ['ee-of-diamonds', 'ee-of-spades', '17', 'dd-jack-of-clubs', '16', 'gg-of-diamonds',
                    'aa-king-of-diamonds', 'dd-jack-of-spades', '9', '4', 'ee-of-hearts', 'hh-of-spades',
                    'bb-queen-of-diamonds', '20', '2', 'hh-of-clubs']
    expected_result = ['ee-of-hearts', 'dd-jack-of-spades', 'ee-of-spades', 'hh-of-spades', 2, 4, 9, 16, 17, 20,
                       'aa-king-of-diamonds', 'bb-queen-of-diamonds', 'ee-of-diamonds', 'gg-of-diamonds',
                       'dd-jack-of-clubs', 'hh-of-clubs']

    assert sort_player_cards(player_cards) == expected_result
