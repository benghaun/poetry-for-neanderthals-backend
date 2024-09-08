import { TeamCards, TeamName } from './team.types';

export class Team {
  private numFullScoreCards: number;
  private numPartialScoreCards: number;
  private numFailedOrSkippedCards: number;

  constructor(public readonly name: TeamName) {
    this.numFullScoreCards = 0;
    this.numPartialScoreCards = 0;
    this.numFailedOrSkippedCards = 0;
  }

  public get score(): number {
    return (
      3 * this.numFullScoreCards +
      this.numPartialScoreCards -
      this.numFailedOrSkippedCards
    );
  }

  public getTeamCards(): TeamCards {
    return {
      numFailedOrSkippedCards: this.numFailedOrSkippedCards,
      numFullScoreCards: this.numFullScoreCards,
      numPartialScoreCards: this.numPartialScoreCards,
    };
  }

  public addTeamCards(teamCards: TeamCards): void {
    this.numFullScoreCards += teamCards.numFullScoreCards;
    this.numPartialScoreCards += teamCards.numPartialScoreCards;
    this.numFailedOrSkippedCards += teamCards.numFailedOrSkippedCards;
  }
}
