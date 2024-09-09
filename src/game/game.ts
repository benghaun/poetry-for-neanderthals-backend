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
  public currentTeam: Team;
  private readonly deck: Deck;
  public isStarted: boolean = false;
  public isEnded: boolean = false;
  public currentCard: Card;

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
    this.deck.shuffle();
    this.currentCard = this.deck.drawCard();
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
    if (
      this.players.find((player) => player.name === playerName) !== undefined
    ) {
      return;
    }
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
    if (this.players.length < 2) {
      throw new Error('Cannot start game with fewer than 2 players');
    }
    shuffle(this.playersGroupedByTeams['Glad']);
    shuffle(this.playersGroupedByTeams['Mad']);
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
    this.deck.shuffle();
    const poet = this.getPoet();
    this._currentRound = new Round(poet);
    this._currentRound.start();
    this._currentRound.on('end', () => this.handleRoundEnd());
  }

  public getPoet(): Player {
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
      this.currentCard = this.deck.drawCard();
    }
  }

  public drawCard(): void {
    if (this._currentRound !== null) {
      this.currentCard = this.deck.drawCard();
    } else {
      throw new NoCurrentRoundError();
    }
  }

  public get currentRound(): Round | null {
    return this._currentRound;
  }

  public undo(): void {
    if (this._currentRound === null) {
      return;
    }
    const lastCard = this._currentRound.undo();
    if (lastCard === null) {
      return;
    }
    this.deck.placeCardOnTop(this.currentCard);
    this.currentCard = lastCard;
  }
}
