import React, { useState } from 'react';
import { useGameStats } from '../hooks/useGameStats';
import { useSound } from '../hooks/useSound';

interface GameStatsProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameStats: React.FC<GameStatsProps> = ({ isOpen, onClose }) => {
  const { getFormattedStats, resetStats } = useGameStats();
  const playSound = useSound();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const stats = getFormattedStats();

  const handleClose = () => {
    playSound('click');
    onClose();
  };

  const handleReset = () => {
    if (showResetConfirm) {
      playSound('click');
      resetStats();
      setShowResetConfirm(false);
    } else {
      playSound('click');
      setShowResetConfirm(true);
    }
  };

  const cancelReset = () => {
    playSound('click');
    setShowResetConfirm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
      <div className="pixelated-border bg-amber-900 p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl text-amber-200 mb-4 text-center">📊 Game Statistics</h2>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-amber-100">
            <span>Total Games:</span>
            <span className="font-bold">{stats.totalGames}</span>
          </div>

          <div className="flex justify-between text-orange-400">
            <span>Player 1 Wins:</span>
            <span className="font-bold">{stats.playerOneWins}</span>
          </div>

          <div className="flex justify-between text-amber-400">
            <span>Player 2 Wins:</span>
            <span className="font-bold">{stats.playerTwoWins}</span>
          </div>

          <div className="flex justify-between text-stone-300">
            <span>Ties:</span>
            <span className="font-bold">{stats.ties}</span>
          </div>

          <div className="border-t border-amber-700/50 pt-3 mt-3">
            <div className="flex justify-between text-amber-100">
              <span>P1 Win Rate:</span>
              <span className="font-bold">{stats.playerOneWinRate}%</span>
            </div>

            <div className="flex justify-between text-amber-100">
              <span>P2 Win Rate:</span>
              <span className="font-bold">{stats.playerTwoWinRate}%</span>
            </div>
          </div>

          <div className="border-t border-amber-700/50 pt-3 mt-3">
            <div className="flex justify-between text-amber-100">
              <span>Current Streak:</span>
              <span className={`font-bold ${stats.currentStreak > 0 ? 'text-green-400' : stats.currentStreak < 0 ? 'text-red-400' : 'text-stone-400'}`}>
                {stats.currentStreak > 0 ? '+' : ''}{stats.currentStreak}
              </span>
            </div>

            <div className="flex justify-between text-amber-100">
              <span>Best Streak:</span>
              <span className="font-bold text-yellow-400">{stats.bestStreak}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {!showResetConfirm ? (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-amber-500 text-amber-950 hover:bg-amber-400 active:bg-amber-600 transform hover:-translate-y-[1px] active:translate-y-[1px] transition-transform font-bold border-4 border-amber-700 pixel-button pixel-shadow w-full"
              >
                Close
              </button>

              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-red-50 hover:bg-red-500 active:bg-red-700 transform hover:-translate-y-[1px] active:translate-y-[1px] transition-transform font-bold border-4 border-red-800 pixel-button pixel-shadow w-full"
              >
                🗑️ Reset Stats
              </button>
            </>
          ) : (
            <>
              <div className="text-center text-amber-100 mb-2">
                <p className="font-semibold">⚠️ Confirm Reset</p>
                <p className="text-sm mt-1">This will delete all statistics. Are you sure?</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={cancelReset}
                  className="flex-1 px-4 py-2 bg-stone-600 text-stone-100 hover:bg-stone-500 active:bg-stone-700 transform hover:-translate-y-[1px] active:translate-y-[1px] transition-transform font-bold border-4 border-stone-800 pixel-button pixel-shadow"
                >
                  Cancel
                </button>

                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-red-600 text-red-50 hover:bg-red-500 active:bg-red-700 transform hover:-translate-y-[1px] active:translate-y-[1px] transition-transform font-bold border-4 border-red-800 pixel-button pixel-shadow"
                >
                  Reset
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameStats;