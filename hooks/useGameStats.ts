import { Player } from '../types';

export interface GameStats {
  totalGames: number;
  playerOneWins: number;
  playerTwoWins: number;
  ties: number;
  currentStreak: number;
  bestStreak: number;
}

const DEFAULT_STATS: GameStats = {
  totalGames: 0,
  playerOneWins: 0,
  playerTwoWins: 0,
  ties: 0,
  currentStreak: 0,
  bestStreak: 0,
};

const STATS_KEY = 'mancala_game_stats';

export const useGameStats = () => {
  // Load stats from localStorage
  const getStats = (): GameStats => {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate that the saved stats has all required fields
        return { ...DEFAULT_STATS, ...parsed };
      }
    } catch (error) {
      console.error('Error loading game stats:', error);
    }
    return DEFAULT_STATS;
  };

  // Save stats to localStorage
  const saveStats = (stats: GameStats) => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving game stats:', error);
    }
  };

  // Record a completed game
  const recordGame = (winner: Player | 'tie' | null) => {
    const stats = getStats();

    stats.totalGames++;

    if (winner === 'tie') {
      stats.ties++;
      stats.currentStreak = 0; // Reset streak on tie
    } else if (winner === Player.One) {
      stats.playerOneWins++;
      stats.currentStreak = Math.max(0, stats.currentStreak) + 1;
    } else if (winner === Player.Two) {
      stats.playerTwoWins++;
      stats.currentStreak = Math.min(0, stats.currentStreak) - 1;
    }

    // Update best streak
    stats.bestStreak = Math.max(stats.bestStreak, Math.abs(stats.currentStreak));

    saveStats(stats);
    return stats;
  };

  // Reset all stats
  const resetStats = () => {
    saveStats(DEFAULT_STATS);
    return DEFAULT_STATS;
  };

  // Get win rate for a specific player
  const getWinRate = (player: Player): number => {
    const stats = getStats();
    const playerWins = player === Player.One ? stats.playerOneWins : stats.playerTwoWins;
    const gamesWithoutTies = stats.totalGames - stats.ties;

    if (gamesWithoutTies === 0) return 0;
    return Math.round((playerWins / gamesWithoutTies) * 100);
  };

  // Get formatted stats display
  const getFormattedStats = () => {
    const stats = getStats();
    return {
      ...stats,
      playerOneWinRate: getWinRate(Player.One),
      playerTwoWinRate: getWinRate(Player.Two),
      overallWinRate: stats.totalGames > 0
        ? Math.round(((stats.playerOneWins + stats.playerTwoWins) / stats.totalGames) * 100)
        : 0,
    };
  };

  return {
    getStats,
    recordGame,
    resetStats,
    getWinRate,
    getFormattedStats,
  };
};