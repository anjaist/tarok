from app.game_utils import deal_new_round

def test_deal_new_round():
    """tests that all cards are dealt between players and talon.
    No cards are left over and no one card is dealt twice"""

    # check dealing for 3 players
    dealt = deal_new_round()
    all_dealt_cards = sum(dealt.values(), [])
    assert len(all_dealt_cards) == len(set(all_dealt_cards))
    assert len(dealt['talon']) == 6
    players = list(dealt)
    players.remove('talon')
    assert len(players) == 3
    for player in players:
        assert len(dealt[player]) == 16

    # check dealing for 4 players
    dealt = deal_new_round(fourth_player=True)
    players = list(dealt)
    players.remove('talon')
    assert len(players) == 4
    for player in players:
        assert len(dealt[player]) == 12
