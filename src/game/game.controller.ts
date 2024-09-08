import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { isEmpty } from 'lodash';
import { Game } from './game';
import type { GameState } from './types';

@Controller('/v1/game')
export class GameController {
  @Post('join')
  public join(@Body('playerName') playerName: string): void {
    if (isEmpty(playerName)) {
      throw new BadRequestException('Player name cannot be empty');
    }
    Game.getOrCreate().addPlayer(playerName);
  }

  @Get('state')
  public getGameState(): GameState {
    const game = Game.getOrCreate();
    return {
      gameStarted: game.isStarted,
      teamMadPlayers: game.players
        .filter((player) => player.team.name === 'Mad')
        .map((player) => player.name),
      teamGladPlayers: game.players
        .filter((player) => player.team.name === 'Glad')
        .map((player) => player.name),
      teamMadScore: game.teamMad.score,
      teamGladScore: game.teamGlad.score,
      currentTeam: game.currentTeam.name,
      currentPoet: game.isStarted ? game.getPoet().name : null,
      timeLeft: game.currentRound?.timeRemaining ?? 0,
      partialText: game.currentCard.partialText,
      fullText: game.currentCard.fullText,
      roundActive: game.currentRound !== null,
      roundStats: {
        oops: game.currentRound?.failedOrSkippedZone.size ?? 0,
        onePoint: game.currentRound?.partialScoreZone.size ?? 0,
        threePoints: game.currentRound?.fullScoreZone.size ?? 0,
      },
      gameEnded: game.isEnded,
    };
  }

  @Post('start')
  public start(): void {
    Game.getOrCreate().startGame();
  }
}
