export type GameState = {
  gameStarted: boolean;
  teamMadPlayers: string[];
  teamGladPlayers: string[];
  teamMadScore: number;
  teamGladScore: number;
  currentTeam: string;
  currentPoet: string | null;
  timeLeft: number;
  partialText: string;
  fullText: string;
  roundActive: boolean;
  gameEnded: boolean;
  roundStats: {
    oops: number;
    onePoint: number;
    threePoints: number;
  };
};
