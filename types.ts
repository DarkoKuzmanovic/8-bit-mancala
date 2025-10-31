
export enum Player {
  One = 1,
  Two = 2,
}

export interface GameState {
  board: number[];
  currentPlayer: Player;
  gameOver: boolean;
  winner: Player | null | 'tie';
  message: string;
}
