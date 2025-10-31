
import React, { useEffect } from 'react';
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
        className={`px-6 py-3 text-lg bg-amber-500 text-amber-950 hover:bg-amber-400 active:bg-amber-600 transform active:translate-y-px border-4 border-amber-700 ${className}`}
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

    const handlePlayAgain = () => {
        playSound('click');
        onPlayAgain();
    }
    const handleGoHome = () => {
        playSound('click');
        onGoHome();
    }

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
      <div className="pixelated-border bg-amber-900 p-8 text-center max-w-sm">
        <h2 className="text-4xl text-amber-200 mb-4">GAME OVER</h2>
        <p className={`text-3xl mb-8 ${color}`}>{message}</p>
        <div className="flex flex-col space-y-4">
          <PixelButton onClick={handlePlayAgain}>
            PLAY AGAIN
          </PixelButton>
          <PixelButton onClick={handleGoHome} className="bg-stone-600 hover:bg-stone-500 active:bg-stone-700 border-stone-800">
            MAIN MENU
          </PixelButton>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
