import { shuffle } from 'lodash';
import { Card } from '../card/card';

export class Deck {
  constructor(private cards: Card[]) {}

  public drawCard(): Card {
    const topCard = this.cards.pop();
    if (topCard === undefined) {
      throw new Error('Cannot draw card as deck is empty');
    }
    return topCard;
  }

  public shuffle(): void {
    this.cards = shuffle(this.cards);
  }

  public placeCardOnTop(card: Card): void {
    this.cards.push(card);
  }
}
