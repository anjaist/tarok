from random import shuffle
from typing import Union

SUITS = ['hearts', 'spades', 'diamonds', 'clubs']
SUIT_CARDS = ['aa-king', 'bb-queen', 'cc-caval', 'dd-jack', 'ee', 'ff', 'gg', 'hh']
TAROK_CARDS = [str(i) for i in range(1, 23)]

POINTS_GAME_TYPE = {'one': 30, 'two': 20, 'three': 10, 'pass': 0}
TRANSLATION_GAME_TYPE = {'three': 'tri', 'two': 'dve', 'one': 'ena', 'pass': 'naprej'}


def get_deck() -> list:
    """creates a deck of cards"""
    deck = TAROK_CARDS.copy()
    for suit in SUITS:
        for card in SUIT_CARDS:
            deck.append(f'{card}-of-{suit}')
    return deck


def deal_new_round(usernames: list) -> dict:
    """Each player gets either 16 or 12 random cards from the deck. 6 random cards are assigned to talon"""
    cards_per_player = 12 if len(usernames) == 4 else 16
    deck = get_deck()
    shuffle(deck)

    dealt = {}

    for player in usernames:
        player_cards = []
        for _ in range(cards_per_player):
            player_cards.append(deck.pop())
        dealt[player] = sort_player_cards(player_cards)

    dealt['talon'] = [deck.pop() for _ in range(6)]
    assert not deck

    return dealt


def sort_player_cards(unsorted_cards: list) -> list:
    """Sorts cards dealt to each player, where hearts are at the far left,
    followed by spades, taroks, diamonds and clubs. The suits are sorted in desc order and the taroks in asc"""
    suits = SUITS[:2] + ['tarok'] + SUITS[2:]
    sorted_cards = []
    for suit_name in suits:
        if suit_name == 'tarok':
            suit = [int(x) for x in unsorted_cards if x.isdigit()]
            suit.sort(reverse=True)
        else:
            suit = [x for x in unsorted_cards if suit_name in x]
            suit.sort()
        sorted_cards.extend(suit)

    return sorted_cards


def is_card_tarok(card: str) -> bool:
    """determines if a card is a tarok"""
    return card.isdigit()


def get_taroks_cards(list_of_cards: list) -> list:
    """returns only tarok cards found in list_of_cards"""
    return [card for card in list_of_cards if is_card_tarok(card)]


def get_card_suit(card: str) -> str:
    """returns the suit of a card in hand"""
    if is_card_tarok(card):
        raise RuntimeError("Can't extract the suit of a tarok card.")
    return card.split('-')[-1]


def get_cards_of_suit(suit: str, cards_in_hand: list) -> list:
    """returns all cards in cards_in_hand that are of the suit specified"""
    return [card for card in cards_in_hand if suit in card]


def get_possible_card_plays(cards_on_table: list, cards_in_hand: list) -> list:
    """returns a list of cards that can be played based on what is already on the table"""
    taroks_in_hand = get_taroks_cards(cards_in_hand)

    # any card can be played if no card is already on the table
    # or if there are three cards on the table (this means the round has to be reset)
    if not cards_on_table or len(cards_on_table):
        return cards_in_hand

    # if XXI and XXII are played in that order, pagat must be played third (if in hand)
    if len(cards_on_table) == 2 and cards_on_table[0] == 21 and cards_on_table[1] == 22:
        if 1 in cards_in_hand:
            return [1]

    # if the card on the table is a tarok, a tarok must be played
    if is_card_tarok(cards_on_table[0]):
        if not taroks_in_hand:  # if there is no tarok in hand, any card can be played
            return cards_in_hand
        return taroks_in_hand

    on_table_suit = get_card_suit(cards_on_table[0])

    # a card of the same suit must be played
    cards_of_suit = get_cards_of_suit(on_table_suit, cards_in_hand)

    # if there is no cards of the same suit in hand, a tarok must be played
    if not cards_of_suit:
        if not taroks_in_hand:  # if there is no tarok in hand, any card can be played
            return cards_in_hand
        return taroks_in_hand
    return cards_of_suit


def determine_winning_card(cards_on_table: list) -> Union[str, int]:
    """returns the card that takes the round (clears the table).
    This method assumes there are three cards on the table."""
    if len(cards_on_table) != 3:
        raise RuntimeError(f'The winning card can only be determined for three cards on the table: {cards_on_table}')

    # if XXI, XXII and I (pagat) are played in that order, pagat takes the round
    if cards_on_table[0] == 22 and cards_on_table[1] == 21 and cards_on_table[2] == 1:
        return 1

    # if there is a tarok in the mix, the highest tarok takes the round
    taroks_on_table = get_taroks_cards(cards_on_table)
    if taroks_on_table:
        return max(taroks_on_table)

    # if the first card is a suit, the highest of that suit takes the table
    on_table_suit = get_card_suit(cards_on_table[0])
    cards_of_suit = get_cards_of_suit(on_table_suit, cards_on_table)
    return min(cards_of_suit)  # suit cards are named in reverse order where 'aa' is the king, 'bb' the queen etc.
