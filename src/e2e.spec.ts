import { groupBy } from 'lodash';
import { Card } from './card/card';
import { Game } from './game/game';

jest.useFakeTimers();
describe('end-to-end game testing, no networking', () => {
  const testCardSuccessFullText = new Card('hello', 'hello world');
  const testCardSuccessPartialText = new Card('beetle', 'beetlejuice');
  const testCardFailed = new Card('you', 'you a failure');
  const testCardSuccessPartialTextTwo = new Card('mega', 'mega heracross');

  it('should end with the correct scoring once all players have completed one round', () => {
    const game = Game.getOrCreate();
    game.addPlayer('player 1');
    game.addPlayer('player 2');
    game.addPlayer('player 3');
    game.addPlayer('player 4');

    // ensure players are always split equally
    const playersGroupedByTeams = groupBy(
      game.players,
      (player) => player.team.name,
    );
    expect(
      Object.values(playersGroupedByTeams).every(
        (playersPerTeam) => playersPerTeam.length === 2,
      ),
    );

    // there should be a total of 4 rounds, since there are 4 players
    // round 1
    game.startGame();
    game.startRound();
    const firstTeam = game['currentTeam'];
    game.currentRound?.placeFullScoreCard(testCardSuccessFullText);
    jest.advanceTimersByTime(60000);
    expect(game.currentRound).toEqual(null);

    // round 2
    game.startRound();
    const secondTeam = game['currentTeam'];
    game.currentRound?.placePartialScoreCard(testCardSuccessPartialText);
    jest.advanceTimersByTime(60000);
    expect(game.currentRound).toEqual(null);

    // round 3
    game.startRound();
    game.currentRound?.placeFailedOrSkippedCard(testCardFailed);
    game.currentRound?.placePartialScoreCard(testCardSuccessPartialTextTwo);
    jest.advanceTimersByTime(60000);
    expect(game.currentRound).toEqual(null);

    // round 4;
    game.startRound();
    jest.advanceTimersByTime(60000);
    expect(game.currentRound).toEqual(null);

    // make sure that game has ended
    expect(game.players.every((player) => player.hasBeenPoet)).toEqual(true);
    expect(() => game.startRound()).toThrow();

    expect(firstTeam.score).toEqual(3);
    expect(secondTeam.score).toEqual(1);
  });
});
