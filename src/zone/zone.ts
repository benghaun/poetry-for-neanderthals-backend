import { Card } from '../card/card';
import { Game } from '../game/game';

export class Zone {
  private _cards: Card[];

  constructor() {
    this._cards = [];
  }

  public placeCard(card: Card): void {
    this._cards.push(card);
    Game.getOrCreate().drawCard();
  }

  public get cards(): Card[] {
    return [...this._cards];
  }

  public get size(): number {
    return this._cards.length;
  }

  public empty(): void {
    this._cards = [];
  }
}
