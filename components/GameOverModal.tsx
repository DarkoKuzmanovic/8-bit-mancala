
import React, { useEffect, useCallback } from 'react';
import { Player } from '../types';
import { useSound } from '../hooks/useSound';

interface GameOverModalProps {
  winner: Player | 'tie' | null;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

const PixelButton: React.FC<{ onClick: () => void, children: React.ReactNode, className?: string }> = ({ onClick, children, className }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 text-lg bg-amber-500 text-amber-950 transform active:translate-y-px border-4 border-amber-700 pixel-button ${className}`}
    >
        {children}
    </button>
);

const GameOverModal: React.FC<GameOverModalProps> = ({ winner, onPlayAgain, onGoHome }) => {
    const playSound = useSound();

    // Play win/tie sound when modal appears
    useEffect(() => {
        if (winner) {
            playSound('win');
        }
    }, [winner, playSound]);

    // Enhanced rematch handler with quick restart
    const handlePlayAgain = useCallback(() => {
        playSound('click');
        onPlayAgain();
    }, [playSound, onPlayAgain]);

    const handleGoHome = useCallback(() => {
        playSound('click');
        onGoHome();
    }, [playSound, onGoHome]);

    // Keyboard shortcuts for quick actions
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            // Space or Enter for quick rematch
            if (event.code === 'Space' || event.code === 'Enter') {
                event.preventDefault();
                handlePlayAgain();
            }
            // Escape to go home
            else if (event.code === 'Escape') {
                event.preventDefault();
                handleGoHome();
            }
            // 'R' key for rematch
            else if (event.key.toLowerCase() === 'r') {
                event.preventDefault();
                handlePlayAgain();
            }
        };

        // Add keyboard listener
        window.addEventListener('keydown', handleKeyPress);

        // Cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [handlePlayAgain, handleGoHome]);

    let message = '';
    let color = 'text-amber-200';
    if (winner === 'tie') {
        message = 'IT\'S A TIE!';
    } else if (winner) {
        message = `PLAYER ${winner} WINS!`;
        color = winner === Player.One ? 'text-orange-400' : 'text-amber-400';
    }

  return (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-[100]">
      {/* Confetti container for wins */}
      {winner !== 'tie' && (
        <div className="confetti-container">
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
        </div>
      )}

      {/* Star burst container for wins */}
      {winner !== 'tie' && (
        <div className="star-burst-container">
          <div className="star-burst"></div>
          <div className="star-burst"></div>
          <div className="star-burst"></div>
        </div>
      )}

      {/* Sparkle container for all game endings */}
      <div className="sparkle-container">
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
      </div>

      <div className={`victory-modal-content pixelated-border bg-amber-900 p-8 text-center max-w-sm ${winner !== 'tie' ? 'victory-celebration' : 'tie-celebration'}`}>
        <h2 className="text-4xl text-amber-200 mb-4">GAME OVER</h2>
        <p className={`text-3xl mb-6 ${color} victory-text`}>{message}</p>

        {/* Quick action shortcuts hint */}
        <div className="mb-6 text-xs text-amber-300/70 space-y-1">
          <p>💡 Quick Actions:</p>
          <div className="flex justify-center gap-4">
            <span className="px-2 py-1 bg-amber-800/50 rounded border border-amber-700/50">
              <kbd className="font-bold">Space</kbd> / <kbd className="font-bold">R</kbd> = Rematch
            </span>
            <span className="px-2 py-1 bg-amber-800/50 rounded border border-amber-700/50">
              <kbd className="font-bold">Esc</kbd> = Menu
            </span>
          </div>
        </div>

        {/* Enhanced button layout with rematch as primary */}
        <div className="flex flex-col space-y-3">
          {/* Prominent rematch button */}
          <button
            onClick={handlePlayAgain}
            className="relative px-8 py-4 text-xl font-bold bg-gradient-to-b from-green-500 to-green-600 text-green-50 border-4 border-green-700 pixel-button pixel-shadow transform hover:scale-105 transition-all duration-200"
          >
            🔄 REMATCH
            <div className="absolute top-0 right-0 -mt-2 -mr-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full animate-pulse">
              QUICK
            </div>
          </button>

          <div className="flex gap-2">
            <PixelButton onClick={handlePlayAgain} className="flex-1 bg-amber-500 text-amber-950 border-amber-700">
              PLAY AGAIN
            </PixelButton>
            <PixelButton onClick={handleGoHome} className="flex-1 bg-stone-600 text-stone-100 border-stone-800">
              MAIN MENU
            </PixelButton>
          </div>
        </div>

        {/* Additional game info for local games */}
        {winner !== 'tie' && (
          <div className="mt-4 pt-4 border-t border-amber-700/30">
            <p className="text-xs text-amber-300/60">
              {winner === Player.One ? 'Player 1' : 'Player 2'} wins! Ready for another round?
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameOverModal;
