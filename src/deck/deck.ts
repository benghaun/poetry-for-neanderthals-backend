import { shuffle } from 'lodash';
import { Card } from '../card/card';

export class Deck {
  constructor(private readonly cards: Card[]) {}

  public drawCard(): Card {
    const topCard = this.cards.pop();
    if (topCard === undefined) {
      throw new Error('Cannot draw card as deck is empty');
    }
    return topCard;
  }

  public shuffle(): void {
    shuffle(this.cards);
  }
}
