import React from 'react';
import Pit from './Pit';
import Store from './Store';
import PlayerIndicator from './PlayerIndicator';
import GameOverModal from './GameOverModal';
import { PLAYER_ONE_PITS, PLAYER_TWO_PITS, PLAYER_ONE_STORE, PLAYER_TWO_STORE } from '../constants';
import { Player, GameState } from '../types';
import { useSoundSettings } from '../hooks/useSoundSettings';
import { useSound } from '../hooks/useSound';

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
  const { settings: soundSettings, toggleMute } = useSoundSettings();
  const playSound = useSound();

  const handleMuteToggle = () => {
    playSound('click');
    toggleMute();
  };

  return (
    <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl pixelated-border board-surface p-3 sm:p-4 md:p-6 relative">
      {gameState.gameOver && (
        <GameOverModal winner={gameState.winner} onPlayAgain={onPlayAgain} onGoHome={onGoHome} />
      )}

      {/* Mute Button - Top Right */}
      <button
        onClick={handleMuteToggle}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 sm:p-2.5 bg-amber-800/80 hover:bg-amber-700/80 text-amber-100 border-2 border-amber-900/80 rounded-lg pixel-shadow transition-all duration-200 hover:scale-105 active:scale-95"
        title={soundSettings.isMuted ? "Unmute sounds" : "Mute sounds"}
      >
        <span className="text-lg sm:text-xl">
          {soundSettings.isMuted ? '🔇' : '🔊'}
        </span>
      </button>

      <div className="mb-3 sm:mb-4 flex items-center justify-center">
        <div className="status-banner text-[9px] sm:text-[10px] md:text-xs text-amber-50 tracking-tight uppercase">
          {gameState.message}
        </div>
      </div>

      {/* Mobile Portrait Layout */}
      <div className="block sm:hidden">
        {/* Player 2 Store */}
        <div className="flex justify-center mb-3">
          <Store stones={gameState.board[PLAYER_TWO_STORE]} player={Player.Two} isActive={gameState.currentPlayer === Player.Two} />
        </div>

        {/* Player 2 Pits */}
        <div className="flex justify-center mb-3">
          <div className="flex gap-1">
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
        </div>

        {/* Player 1 Pits */}
        <div className="flex justify-center mb-3">
          <div className="flex gap-1">
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

        {/* Player 1 Store */}
        <div className="flex justify-center mb-3">
          <Store stones={gameState.board[PLAYER_ONE_STORE]} player={Player.One} isActive={gameState.currentPlayer === Player.One} />
        </div>
      </div>

      {/* Desktop/Tablet Layout */}
      <div className="hidden sm:flex justify-between items-center">
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

      {/* Player Indicators - always horizontal */}
      <div className="mt-3 sm:mt-4 flex justify-between">
        <PlayerIndicator player={Player.Two} isActive={gameState.currentPlayer === Player.Two} isYou={playerNumber === Player.Two} />
        <PlayerIndicator player={Player.One} isActive={gameState.currentPlayer === Player.One} isYou={playerNumber === Player.One} />
      </div>

    </div>
  );
};

export default GameBoard;
