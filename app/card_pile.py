"""this module contains the properties and util functions of a pile of tarok cards"""


class CardPile:
    def __init__(self, card_pile: list):
        self.cards = card_pile
        self.cards_simplified = self.simplify_names(card_pile)

    @property
    def is_valat(self) -> bool:
        """valat occurred if the user collected all of the cards (54 - leftover talon, which is min 3 and max 5)"""
        return True if len(self.cards) >= 49 else False

    @property
    def is_all_kings(self) -> bool:
        """checks if all kings have been collected by a player in their pile"""
        return True if self.cards.count('king') == 4 else False

    @property
    def is_trula(self) -> bool:
        """checks if all three of the trula cards (I, XXI and XXII) have been collected"""
        return True if '1' in self.cards and '21' in self.cards and '22' in self.cards else False

    @property
    def is_pagat_ultimo(self) -> bool:
        """With the 'pagat' option, it is important that the '1' tarok was not only collected but was played last.
        If 'pagat' is in the main user's pile, it means they played it. If it is in the against users' pile,
        'pagat' must be the only tarok played that round to get + points, otherwise 'pagat ultimo' has failed
        (points deducted for against users)"""
        taroks_in_last_round = self.get_tarok_cards(self.cards[-3:])
        if '1' not in taroks_in_last_round or len(taroks_in_last_round) > 1:
            return False
        return True

    @staticmethod
    def simplify_names(pile: list) -> list:
        """simplifies the names of cards in a pile, where the names 'king', 'queen' etc. are extracted from the original
        longer string. If a card is neither a tarok or a king, queen etc., the name will be changed to 'of'."""
        renamed_pile = []
        for card in pile:
            if not card.isdigit():
                renamed_pile.append(card.split('-')[1])
            else:
                renamed_pile.append(card)

        return renamed_pile

    def group_by_three(self) -> list:
        """Because cards are counted three at a time, this method can be used to group cards within the pile by three.
        Returns a list of lists, each sublist containing 3 elements, with the last one containing 1, 2 or 3."""
        grouped_cards = []
        for i in range(0, len(self.cards_simplified), 3):
            grouped_cards.append(self.cards_simplified[i:i + 3])
        return grouped_cards

    @staticmethod
    def is_card_tarok(card: str) -> bool:
        """determines if a card is a tarok"""
        return card.isdigit()

    def get_tarok_cards(self, card_pile: list = None) -> list:
        """returns only tarok cards found in list_of_cards"""
        if card_pile is None:
            card_pile = self.cards
        return [card for card in card_pile if self.is_card_tarok(card)]

    @staticmethod
    def get_card_suit(card: str) -> str:
        """returns the suit of a card in hand"""
        if CardPile.is_card_tarok(card):
            raise RuntimeError("Can't extract the suit of a tarok card.")
        return card.split('-')[-1]

    def get_cards_of_suit(self, suit: str) -> list:
        """returns all cards in cards_in_hand that are of the suit specified"""
        return [card for card in self.cards if suit in card]

    @staticmethod
    def round_to_five(number):
        return 5 * round(number/5)
