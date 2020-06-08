from random import shuffle

import pytest

from app.game_utils import deal_new_round, sort_player_cards, count_cards_in_pile, get_called_calculation, \
    check_for_extras


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


def test_count_cards_in_pile():
    """tests that cards in a pile are counted correctly"""
    test_pile = ['aa-king-of-hearts', '2', 'hh-of-hearts', 'aa-king-of-clubs', 'ff-of-clubs', 'dd-jack-of-clubs',
                 'gg-of-hearts', 'dd-jack-of-hearts', '4', 'dd-jack-of-diamonds', 'aa-king-of-diamonds',
                 'bb-queen-of-diamonds', 'ff-of-hearts', '7', '11', 'bb-queen-of-hearts', '20', '22', '14',
                 'aa-king-of-spades', '8', '15', 'hh-of-spades', '10', '18', 'ee-of-hearts', '12', '13', 'gg-of-spades',
                 'ff-of-spades', '6', 'dd-jack-of-spades', 'ee-of-spades']

    assert count_cards_in_pile(test_pile) == 41
    shuffle(test_pile)
    assert count_cards_in_pile(test_pile) == 41


@pytest.mark.parametrize('test_pile, called, expected', [
                            (['1', '21', 'hh-of-hearts', '22', '10'], ['trula'], {'trula': 20}),
                            (['1', '21', 'hh-of-hearts', '11', '10'], ['trula'], {'trula': -20}),
                            (['5', '6', 'hh-of-hearts', 'bb-queen-of-diamonds', '1'], ['pagat'], {'pagat': 50}),
                            (['5', '6', 'hh-of-hearts', 'bb-queen-of-diamonds', '1', 'hh-of-spades', 'ee-of-spades'],
                             ['pagat'], {'pagat': 50}),
                            (['5', '6', 'hh-of-hearts', 'bb-queen-of-diamonds', '1', '22', 'ee-of-spades'],
                             ['pagat'], {'pagat': -50}),
                            (['11', '21', 'hh-of-hearts', 'ee-of-diamonds', '22', 'hh-of-spades', 'ee-of-spades', '1'],
                             ['pagat', 'trula'], {'pagat': 50, 'trula': 20}),
                            (['5', '6', 'aa-king-of-clubs', 'aa-king-of-diamonds', '1', '22', 'aa-king-of-spades',
                              'aa-king-of-hearts'], ['kralji'], {'kralji': 20}),
                            (['5', '6', 'hh-of-hearts', 'bb-queen-of-diamonds', '1', '22', 'ee-of-spades'],
                             ['kralji'], {'kralji': -20}),
                            (['1', '21', 'hh-of-hearts', '11', '10'], ['valat'], {'valat': -500})
])
def test_points_for_called(test_pile, called, expected):
    """tests that points are added/deducted for called options"""
    if len(called) == 1:
        assert get_called_calculation(test_pile, called) == expected
    else:
        result = get_called_calculation(test_pile, called)
        for entry in result:
            assert entry in expected


@pytest.mark.parametrize('test_pile, expected', [
                            (['1', '21', 'hh-of-hearts', '22', '10'], {'trula': 10}),
                            (['5', '6', 'hh-of-hearts', 'bb-queen-of-diamonds', '1'], {'pagat': 25}),
                            (['5', '6', 'hh-of-hearts', 'bb-queen-of-diamonds', '1', 'hh-of-spades', 'ee-of-spades'],
                             {'pagat': 25}),
                            (['11', '21', 'hh-of-hearts', 'ee-of-diamonds', '22', 'hh-of-spades', 'ee-of-spades', '1'],
                             {'pagat': 25, 'trula': 10}),
                            (['5', '6', 'aa-king-of-clubs', 'aa-king-of-diamonds', '1', '22', 'aa-king-of-spades',
                              'aa-king-of-hearts'], {'kralji': 10})
])
def test_points_extras(test_pile, expected):
    """tests that points are added for extras even if they weren't called"""
    result = check_for_extras(test_pile, against_pile=['2', '3', '4'], called=['nič'])
    for entry in result:
        assert entry in expected


def test_against_players_pagat_ultimo():
    """tests that 25 points are deducted when the co-players have achieved pagat ultimo.
    Pagat ultimo is only valid, if pagat is the only tarok in that round"""
    main_pile = ['hh-of-hearts', '2', '3','bb-queen-of-diamonds', 'aa-king-of-diamonds', 'hh-of-diamonds']
    against_pile = ['4', '5', '6', '1', 'aa-king-of-hearts', 'ee-of-hearts']

    result_extras1 = check_for_extras(main_pile, against_pile, ['trula'])
    assert result_extras1['pagat'] == -25

    against_pile.pop(-1)
    against_pile.append('20')
    result_extras2 = check_for_extras(main_pile, against_pile, ['trula'])
    assert 'pagat' not in result_extras2.keys()
