from random import shuffle

SUITS = ['hearts', 'spades', 'clubs', 'diamonds']
SUIT_CARDS = ['aa-king', 'bb-queen', 'cc-caval', 'dd-jack', 'ee', 'ff', 'gg', 'hh']
TAROK_CARDS = [str(i) for i in range(1, 23)]

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

    dealt =  {}

    for player in usernames:
        player_cards = []
        for _ in range(cards_per_player):
            player_cards.append(deck.pop())
        print('------')
        print(f'player cards: {player_cards}')
        print(f'sorted: {sort_player_cards(player_cards)}')
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
        else:
            suit = [x for x in unsorted_cards if suit_name in x]
        sorted_cards.extend(sorted(suit))

    return sorted_cards
