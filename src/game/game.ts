import { shuffle } from 'lodash';
import { Card } from '../card/card';
import { ALL_CARDS } from '../card/const';
import { Deck } from '../deck/deck';
import { NoCurrentRoundError } from '../errors/errors';
import { Player } from '../player/player';
import { Round } from '../round/round';
import { Team } from '../team/team';
import { TeamName } from '../team/team.types';

export class Game {
  public readonly players: Player[];
  public readonly teamMad: Team;
  public readonly teamGlad: Team;
  private playersGroupedByTeams: Record<TeamName, Player[]>;
  private currentPlayerIdx: number;
  private _currentRound: Round | null;
  private currentTeam: Team;
  public readonly deck: Deck;
  private isStarted: boolean = false;
  private isEnded: boolean = false;

  private static currentGame: Game | null = null;

  private constructor() {
    this.players = [];
    this.teamGlad = new Team('Glad');
    this.teamMad = new Team('Mad');

    this.currentPlayerIdx = 0;
    this.playersGroupedByTeams = {
      Glad: [],
      Mad: [],
    };
    this._currentRound = null;
    const randIdx: 0 | 1 = Math.floor(Math.random() * 2) as 0 | 1;
    const teams: [Team, Team] = [this.teamMad, this.teamGlad];
    this.currentTeam = teams[randIdx];
    this.deck = new Deck(ALL_CARDS);
  }

  static getOrCreate(): Game {
    if (this.currentGame === null) {
      const newGame = new Game();
      this.currentGame = newGame;
      return newGame;
    }
    return this.currentGame;
  }

  private getTeamWithFewerPlayers(): Team {
    if (
      this.playersGroupedByTeams['Glad'].length >
      this.playersGroupedByTeams['Mad'].length
    ) {
      return this.teamMad;
    }
    return this.teamGlad;
  }

  public addPlayer(playerName: string): void {
    if (this.isStarted) {
      throw new Error('Cannot add player to game that has already started');
    }
    const teamWithFewerPlayers = this.getTeamWithFewerPlayers();
    const player = new Player(playerName, teamWithFewerPlayers);
    this.players.push(player);
    this.playersGroupedByTeams[player.team.name].push(player);
  }

  public startGame(): void {
    if (this.isStarted) {
      throw new Error('Cannot start game that has already started');
    }
    shuffle(this.playersGroupedByTeams['Glad']);
    shuffle(this.playersGroupedByTeams['Mad']);
    this.deck.shuffle();
    this.isStarted = true;
  }

  public startRound(): void {
    if (this.isEnded) {
      throw new Error('Cannot start round for a game that has ended');
    }
    if (this._currentRound !== null) {
      throw new Error(
        'Previous round has not yet ended, cannot start new round',
      );
    }
    const poet = this.getPoet();
    this._currentRound = new Round(poet);
    this._currentRound.start();
    this._currentRound.on('end', () => this.handleRoundEnd());
  }

  private getPoet(): Player {
    const poet =
      this.playersGroupedByTeams[this.currentTeam.name][this.currentPlayerIdx];
    if (poet === undefined) {
      throw new Error('No possible poet - was there an array overflow?');
    }
    return poet;
  }

  private handleRoundEnd(): void {
    this._currentRound?.removeAllListeners();
    this._currentRound = null;
    this.getPoet().hasBeenPoet = true;
    if (this.players.every((player) => player.hasBeenPoet)) {
      this.isEnded = true;
    } else {
      const poet = this.getPoet();
      const nextTeam = poet.team.name === 'Glad' ? this.teamMad : this.teamGlad;
      this.currentTeam = nextTeam;
      if (
        this.playersGroupedByTeams[nextTeam.name][this.currentPlayerIdx]
          ?.hasBeenPoet
      ) {
        this.currentPlayerIdx++;
      }
    }
  }

  public drawCard(): Card {
    if (this._currentRound !== null) {
      return this.deck.drawCard();
    } else {
      throw new NoCurrentRoundError();
    }
  }

  public get currentRound(): Round | null {
    return this._currentRound;
  }
}
