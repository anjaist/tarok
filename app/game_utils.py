from random import shuffle

SUITS = ['hearts', 'spades', 'clubs', 'diamonds']
SUIT_CARDS = ['king', 'queen', 'caval', 'jack', 10, 9, 8, 7]
TAROK_CARDS = [i for i in range(1, 23)]

def get_deck() -> list:
    """creates a deck of cards"""
    deck = TAROK_CARDS.copy()
    for suit in SUITS:
        for card in SUIT_CARDS:
            deck.append(f'{card} of {suit}')
    return deck


def deal_new_round(fourth_player: bool = False) -> dict:
    """Each player gets either 16 or x random cards from the deck. 6 random cards are asigned to talon"""
    cards_per_player = 12 if fourth_player else 16
    deck = get_deck()
    shuffle(deck)

    dealt =  {}

    for player in ['player_one', 'player_two', 'player_three']:
        player_cards = []
        for _ in range(cards_per_player):
            player_cards.append(deck.pop())
        dealt[player] = player_cards

    dealt['talon'] = [deck.pop() for _ in range(6)]

    if fourth_player:
        dealt['player_four'] = deck

    return dealt
