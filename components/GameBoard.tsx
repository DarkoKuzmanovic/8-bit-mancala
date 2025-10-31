import React from 'react';
import Pit from './Pit';
import Store from './Store';
import PlayerIndicator from './PlayerIndicator';
import GameOverModal from './GameOverModal';
import { PLAYER_ONE_PITS, PLAYER_TWO_PITS, PLAYER_ONE_STORE, PLAYER_TWO_STORE } from '../constants';
import { Player, GameState } from '../types';

interface GameBoardProps {
    gameState: GameState;
    playerNumber: Player | null;
    animatingPits: Set<number>;
    highlightedPit: number | null;
    onMakeMove: (pitIndex: number) => void;
    onGoHome: () => void;
    onPlayAgain: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, playerNumber, animatingPits, highlightedPit, onMakeMove, onGoHome, onPlayAgain }) => {

  const isMyTurn = gameState.currentPlayer === playerNumber;

  return (
    <div className="w-full max-w-4xl pixelated-border board-surface p-4 md:p-6">
      {gameState.gameOver && (
        <GameOverModal winner={gameState.winner} onPlayAgain={onPlayAgain} onGoHome={onGoHome} />
      )}

      <div className="mb-4 flex items-center justify-center">
        <div className="status-banner text-[10px] md:text-xs text-amber-50 tracking-tight uppercase">
          {gameState.message}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Store stones={gameState.board[PLAYER_TWO_STORE]} player={Player.Two} isActive={gameState.currentPlayer === Player.Two} />

        <div className="flex-grow flex flex-col justify-between mx-2 md:mx-4">
          {/* Player 2 Pits */}
          <div className="flex justify-center mb-4">
            {PLAYER_TWO_PITS.slice().reverse().map((pitIndex) => {
              const isClickable = isMyTurn && playerNumber === Player.Two && gameState.board[pitIndex] > 0;
              return (
                <Pit
                  key={pitIndex}
                  stones={gameState.board[pitIndex]}
                  onClick={() => onMakeMove(pitIndex)}
                  isClickable={isClickable}
                  isAnimating={animatingPits.has(pitIndex)}
                  isHighlighted={highlightedPit === pitIndex}
                />
              )
            })}
          </div>

          {/* Player 1 Pits */}
          <div className="flex justify-center">
            {PLAYER_ONE_PITS.map((pitIndex) => {
              const isClickable = isMyTurn && playerNumber === Player.One && gameState.board[pitIndex] > 0;
              return (
                <Pit
                  key={pitIndex}
                  stones={gameState.board[pitIndex]}
                  onClick={() => onMakeMove(pitIndex)}
                  isClickable={isClickable}
                  isAnimating={animatingPits.has(pitIndex)}
                  isHighlighted={highlightedPit === pitIndex}
                />
              )
            })}
          </div>
        </div>

        <Store stones={gameState.board[PLAYER_ONE_STORE]} player={Player.One} isActive={gameState.currentPlayer === Player.One} />
      </div>

      <div className="mt-4 flex justify-between">
        <PlayerIndicator player={Player.Two} isActive={gameState.currentPlayer === Player.Two} isYou={playerNumber === Player.Two} />
        <PlayerIndicator player={Player.One} isActive={gameState.currentPlayer === Player.One} isYou={playerNumber === Player.One} />
      </div>

    </div>
  );
};

export default GameBoard;
