import { Controller, Post } from '@nestjs/common';
import { Game } from '../game/game';

@Controller('/v1/round')
export class RoundController {
  @Post('start')
  public start(): void {
    Game.getOrCreate().startRound();
  }

  @Post('oops')
  public oops(): void {
    const game = Game.getOrCreate();
    game.currentRound?.placeFailedOrSkippedCard(game.currentCard);
  }

  @Post('one-point')
  public onePoint(): void {
    const game = Game.getOrCreate();
    game.currentRound?.placePartialScoreCard(game.currentCard);
  }

  @Post('three-points')
  public threePoints(): void {
    const game = Game.getOrCreate();
    game.currentRound?.placeFullScoreCard(game.currentCard);
  }
}
