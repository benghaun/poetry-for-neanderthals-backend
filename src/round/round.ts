import { EventEmitter } from 'stream';
import { Card } from '../card/card';
import { Player } from '../player/player';
import { Zone } from '../zone/zone';

export class Round extends EventEmitter<{ end: [] }> {
  public readonly fullScoreZone: Zone;
  public readonly partialScoreZone: Zone;
  public readonly failedOrSkippedZone: Zone;
  private _timeRemaining: number;
  private timer: NodeJS.Timeout | null;
  private history: Zone[];

  constructor(public readonly poet: Player) {
    super();
    this.fullScoreZone = new Zone();
    this.partialScoreZone = new Zone();
    this.failedOrSkippedZone = new Zone();
    this._timeRemaining = 60;
    this.timer = null;
    this.history = [];
  }

  public start(): void {
    this.timer = setInterval(() => {
      this._timeRemaining -= 1;
      if (this._timeRemaining === 0) {
        this.finish();
      }
    }, 1000);
  }

  private finish(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
    }
    this.poet.team.addTeamCards({
      numFullScoreCards: this.fullScoreZone.size,
      numFailedOrSkippedCards: this.failedOrSkippedZone.size,
      numPartialScoreCards: this.partialScoreZone.size,
    });
    this.emit('end');
  }

  public get timeRemaining(): number {
    return this._timeRemaining;
  }

  public placeFullScoreCard(card: Card): void {
    this.fullScoreZone.placeCard(card);
    this.history.push(this.fullScoreZone);
  }

  public placePartialScoreCard(card: Card): void {
    this.partialScoreZone.placeCard(card);
    this.history.push(this.partialScoreZone);
  }

  public placeFailedOrSkippedCard(card: Card): void {
    this.failedOrSkippedZone.placeCard(card);
    this.history.push(this.failedOrSkippedZone);
  }

  public undo(): Card | null {
    const lastZone = this.history.pop();
    if (!lastZone) {
      return null;
    }
    return lastZone.removeLastCard();
  }
}
