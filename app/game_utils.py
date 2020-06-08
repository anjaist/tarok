from random import shuffle

SUITS = ['hearts', 'spades', 'diamonds', 'clubs']
SUIT_CARDS = ['aa-king', 'bb-queen', 'cc-caval', 'dd-jack', 'ee', 'ff', 'gg', 'hh']
TAROK_CARDS = [str(i) for i in range(1, 23)]

POINTS_GAME_TYPE = {'one': 30, 'two': 20, 'three': 10, 'pass': 0}
POINTS_CARD_TYPE = {'king': 5, 'queen': 4, 'caval': 3, 'jack': 2, '1': 5, '21': 5, '22': 5}
POINTS_CALLED = {'trula': 20, 'pagat': 50, 'kralji': 20, 'valat': 500, 'nič': 0}
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
    if not cards_on_table or len(cards_on_table) == 3:
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


def determine_winning_card(cards_on_table: list) -> str:
    """returns the card that takes the round (clears the table).
    This method assumes there are three cards on the table."""
    if len(cards_on_table) != 3:
        raise RuntimeError(f'The winning card can only be determined for three cards on the table: {cards_on_table}')

    # if XXI, XXII and I (pagat) are played in that order, pagat takes the round
    if cards_on_table[0] == 22 and cards_on_table[1] == 21 and cards_on_table[2] == 1:
        return '1'

    # if there is a tarok in the mix, the highest tarok takes the round
    taroks_on_table = get_taroks_cards(cards_on_table)
    if taroks_on_table:
        taroks_as_ints = [int(card) for card in taroks_on_table]
        return str(max(taroks_as_ints))

    # if the first card is a suit, the highest of that suit takes the table
    on_table_suit = get_card_suit(cards_on_table[0])
    cards_of_suit = get_cards_of_suit(on_table_suit, cards_on_table)
    return min(cards_of_suit)  # suit cards are named in reverse order where 'aa' is the king, 'bb' the queen etc.


def simplify_names_in_pile(pile: list) -> list:
    """simplifies the names of cards in a pile, where the names 'king', 'queen' etc. are extracted from the original
    longer string. If a card is neither a tarok or a king, queen etc., the name will be changed to 'of'."""
    renamed_pile = []
    for card in pile:
        if not card.isdigit():
            renamed_pile.append(card.split('-')[1])
        else:
            renamed_pile.append(card)

    return renamed_pile


def count_cards_in_pile(cards_in_pile: list) -> int:
    """counts the cards in pile, where the worth of the cards is as follows:
         * king = 5
         * queen = 4
         * caval = 3
         * jack = 2
         * I, XXI, XXII = 5
     Cards are counted three at a time. If three of the cards are worth > 1, 2 is deducted,
     if only 2 of them are > 1, 1 is deducted. If all three cards are not worth anything, 1 point is added.
     The reason for the points deduction is that this ensures the cards always add to the same amount,
     no matter what order they are counted in."""
    cards_in_pile = simplify_names_in_pile(cards_in_pile)

    # group cards by 3
    grouped_cards = []
    for i in range(0, len(cards_in_pile), 3):
        grouped_cards.append(cards_in_pile[i:i+3])

    # add the value of each group of 3 to count, minding if any points need to be deducted
    count = 0
    for card_group in grouped_cards:
        cards_of_worth = 0
        for card in card_group:
            if card in POINTS_CARD_TYPE.keys():
                count += POINTS_CARD_TYPE[card]
                cards_of_worth += 1

        if cards_of_worth == 3:
            points_to_reduce = 2
        elif cards_of_worth == 2:
            points_to_reduce = 1
        else:
            points_to_reduce = 0

        count -= points_to_reduce

    return count


def get_called_calculation(cards_in_pile: list, called: list) -> dict:
    """Finds out if the called options have been achieved. Returns a positive value for each option successfully
    obtained, and a negative value for not collected called items"""
    called_calc = {}

    for called_option in called:
        calculated_value = check_called_option(cards_in_pile, called_option)
        called_calc[called_option] = calculated_value

    return called_calc


def check_called_option(cards_in_pile: list, called_option: str) -> int:
    """returns the positive or negative value of called, depending on if the called cards (in correct order)
    are in the user's pile. This method should be called for each individual option that was called"""
    cards_in_pile = simplify_names_in_pile(cards_in_pile)

    if called_option == 'valat':
        negative_multiplier = +1 if check_for_valat(cards_in_pile) else -1
    elif called_option == 'kralji':
        negative_multiplier = +1 if check_for_all_kings(cards_in_pile) else -1
    elif called_option == 'trula':
        negative_multiplier = +1 if check_for_trula(cards_in_pile) else -1
    elif called_option == 'pagat':
        negative_multiplier = +1 if check_for_pagat_ultimo(cards_in_pile) else -1
    else:
        return 0

    return negative_multiplier * POINTS_CALLED[called_option]


def check_for_extras(main_player_pile: list, against_pile: list, called: list) -> dict:
    """if trula, valat, kralji, or pagat ultimo were achieved, they are added to the score
    even if they weren't called in advance but only at half value.

    If any of those were achieved by the co-players (who play together against the main player),
    those points are deducted (at half value)"""
    options_to_check = ['valat', 'kralji', 'trula', 'pagat']
    extras_calc = {}

    for option in options_to_check:
        if option not in called:
            # check main player's pile
            calculated_value = check_called_option(main_player_pile, option)
            if calculated_value > 0:  # if value is positive, it means the option was successfully achieved/collected
                extras_calc[option] = int(calculated_value / 2)

            # check against players' pile
            to_be_deducted = check_called_option(against_pile, option)
            if to_be_deducted > 0:  # if value is positive, it means the option was successfully achieved/collected
                extras_calc[option] = int(-to_be_deducted / 2)

    return extras_calc


def check_for_valat(pile: list) -> bool:
    """valat occurred if the user collected all of the cards (54 - leftover talon, which is min 3 and max 5)"""
    return True if len(pile) >= 49 else False


def check_for_all_kings(pile: list) -> bool:
    """checks if all kings have been collected by a player in their pile"""
    return True if pile.count('king') == 4 else False


def check_for_trula(pile: list) -> bool:
    """checks if all three of the trula cards (I, XXI and XXII) have been collected"""
    return True if '1' in pile and '21' in pile and '22' in pile else False


def check_for_pagat_ultimo(pile: list) -> bool:
    """With the 'pagat' option, it is important that the '1' tarok was not only collected but was played last.
    If 'pagat' is in the main user's pile, it means they played it. If it is in the against users' pile,
    'pagat' must be the only tarok played that round to get + points, otherwise 'pagat ultimo' has failed
    (points deducted for against users)"""
    taroks_in_last_round = get_taroks_cards(pile[-3:])
    if '1' not in taroks_in_last_round or len(taroks_in_last_round) > 1:
        return False
    return True
