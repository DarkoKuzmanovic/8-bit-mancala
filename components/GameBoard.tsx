import React, { useEffect } from 'react';
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
    onUndoMove?: () => void;
    canUndo?: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, playerNumber, animatingPits, highlightedPit, onMakeMove, onGoHome, onPlayAgain, onUndoMove, canUndo = false }) => {

  const isMyTurn = gameState.currentPlayer === playerNumber;
  const { settings: soundSettings, toggleMute } = useSoundSettings();
  const playSound = useSound();

  const handleMuteToggle = () => {
    playSound('click');
    toggleMute();
  };

  const handleUndoMove = () => {
    if (onUndoMove && canUndo) {
      onUndoMove();
    }
  };

  // Keyboard shortcuts for undo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Z for undo
      if (event.ctrlKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        handleUndoMove();
      }
      // Also support Ctrl+U for undo
      if (event.ctrlKey && event.key.toLowerCase() === 'u') {
        event.preventDefault();
        handleUndoMove();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, onUndoMove]);

  return (
    <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl pixelated-border board-surface p-3 sm:p-4 md:p-6 relative">
      {gameState.gameOver && (
        <GameOverModal winner={gameState.winner} onPlayAgain={onPlayAgain} onGoHome={onGoHome} />
      )}

      {/* Undo Button - Top Left (Local Games Only) */}
      {onUndoMove && canUndo && (
        <button
          onClick={handleUndoMove}
          className="absolute top-2 left-2 sm:top-3 sm:left-3 p-2 sm:p-2.5 bg-blue-600/80 hover:bg-blue-500/80 text-blue-100 border-2 border-blue-800/80 rounded-lg pixel-shadow transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo last move (Ctrl+Z)"
        >
          <span className="text-lg sm:text-xl">↶</span>
        </button>
      )}

      {/* Mute Button - Top Right */}
      <button
        onClick={handleMuteToggle}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 sm:p-2.5 bg-amber-800/80 hover:bg-amber-700/80 text-amber-100 border-2 border-amber-900/80 rounded-lg pixel-shadow transition-all duration-200 hover:scale-105 active:scale-95 sound-toggle"
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
