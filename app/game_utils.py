from random import shuffle

SUITS = ['hearts', 'spades', 'clubs', 'diamonds']
SUIT_CARDS = ['king', 'queen', 'caval', 'jack', 10, 9, 8, 7]
TAROK_CARDS = [i for i in range(1, 23)]

def get_deck() -> list:
    """creates a deck of cards"""
    deck = TAROK_CARDS.copy()
    for suit in SUITS:
        for card in SUIT_CARDS:
            deck.append(f'{card}-of-{suit}')
    return deck


def deal_new_round(usernames: list) -> dict:
    """Each player gets either 16 or 12 random cards from the deck. 6 random cards are asigned to talon"""
    cards_per_player = 12 if len(usernames) == 4 else 16
    deck = get_deck()
    shuffle(deck)

    dealt =  {}

    for player in usernames:
        player_cards = []
        for _ in range(cards_per_player):
            player_cards.append(deck.pop())
        dealt[player] = player_cards

    dealt['talon'] = [deck.pop() for _ in range(6)]
    assert not deck

    return dealt
