import { useState, useCallback } from 'react';
import { Player, GameState } from '../types';
import { INITIAL_BOARD, PLAYER_ONE_PITS, PLAYER_TWO_PITS, PLAYER_ONE_STORE, PLAYER_TWO_STORE } from '../constants';
import { useSound } from './useSound';

const createInitialState = (): GameState => ({
  board: [...INITIAL_BOARD],
  currentPlayer: Player.One,
  gameOver: false,
  winner: null,
  message: 'PLAYER 1 TURN',
});

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [animatingPits, setAnimatingPits] = useState<Set<number>>(new Set());
  const [highlightedPit, setHighlightedPit] = useState<number | null>(null);
  const [captureEffect, setCaptureEffect] = useState(false);
  const playSound = useSound();

  const resetGame = useCallback(() => {
    setGameState(createInitialState());
    setAnimatingPits(new Set());
    setHighlightedPit(null);
    setCaptureEffect(false);
  }, []);

  const sowSeeds = useCallback((pitIndex: number) => {
    if (gameState.gameOver) return;

    // FIX: The original destructuring on line 26 was causing errors and also introduced a state mutation bug. Replaced with explicit copies of state properties to modify.
    let board = [...gameState.board];
    let currentPlayer = gameState.currentPlayer;
    let message = gameState.message;

    // Validate move
    const isPlayerOne = currentPlayer === Player.One;
    if ((isPlayerOne && !PLAYER_ONE_PITS.includes(pitIndex)) || (!isPlayerOne && !PLAYER_TWO_PITS.includes(pitIndex))) {
      playSound('invalidMove', pitIndex);
      return; // Not player's pit
    }
    if (board[pitIndex] === 0) {
      playSound('invalidMove', pitIndex);
      return; // Empty pit
    }

    playSound('pickup');

    const originalStoneCount = board[pitIndex]; // Capture BEFORE modifying
    let stonesAvailable = board[pitIndex];
    board[pitIndex] = 0;

    let currentIndex = pitIndex;
    const opponentStore = isPlayerOne ? PLAYER_TWO_STORE : PLAYER_ONE_STORE;

    while (stonesAvailable > 0) {
      currentIndex = (currentIndex + 1) % 14;
      if (currentIndex === opponentStore) continue;

      board[currentIndex]++;
      stonesAvailable--;
      playSound('drop');
    }

    // Clean, simple animation that prevents overlap
    if (originalStoneCount > 0) {
      for (let i = 0; i < originalStoneCount; i++) {
        setTimeout(() => {
          let tempIndex = (pitIndex + i + 1) % 14;
          if (tempIndex === opponentStore) tempIndex = (tempIndex + 1) % 14;
          setHighlightedPit(tempIndex);

          setTimeout(() => {
            if (setHighlightedPit) setHighlightedPit(null);
          }, 200);
        }, i * 250);
      }
    }

    // Check game rules after sowing
    const lastStonePit = currentIndex;
    const ownStore = isPlayerOne ? PLAYER_ONE_STORE : PLAYER_TWO_STORE;

    // Rule 1: Go again
    if (lastStonePit === ownStore) {
      message = `PLAYER ${currentPlayer} GOES AGAIN!`;
    }
    // Rule 2: Capture
    else if (board[lastStonePit] === 1 && (isPlayerOne ? PLAYER_ONE_PITS : PLAYER_TWO_PITS).includes(lastStonePit)) {
      const oppositePit = 12 - lastStonePit;
      if (board[oppositePit] > 0) {
        const capturedStones = board[oppositePit] + 1;
        board[oppositePit] = 0;
        board[lastStonePit] = 0;
        board[ownStore] += capturedStones;
        message = `PLAYER ${currentPlayer} CAPTURED ${capturedStones} STONES!`;

        // Play capture bonus sound for big captures
        if (capturedStones >= 8) {
          playSound('captureBonus');
        } else {
          playSound('capture');
        }

        setCaptureEffect(true);
        setTimeout(() => setCaptureEffect(false), 500); // Show capture effect for 500ms
        currentPlayer = isPlayerOne ? Player.Two : Player.One; // Switch turn after capture
      } else {
         currentPlayer = isPlayerOne ? Player.Two : Player.One; // Switch turn
      }
    }
    // Default: Switch turn
    else {
      currentPlayer = isPlayerOne ? Player.Two : Player.One;
    }

    // Check for Game Over
    const playerOnePitsEmpty = PLAYER_ONE_PITS.every(p => board[p] === 0);
    const playerTwoPitsEmpty = PLAYER_TWO_PITS.every(p => board[p] === 0);

    let gameOver = false;
    let winner: Player | null | 'tie' = null;

    if (playerOnePitsEmpty || playerTwoPitsEmpty) {
      gameOver = true;
      playSound('win');

      const remainingP1 = PLAYER_ONE_PITS.reduce((sum, p) => sum + board[p], 0);
      board[PLAYER_ONE_STORE] += remainingP1;
      PLAYER_ONE_PITS.forEach(p => board[p] = 0);

      const remainingP2 = PLAYER_TWO_PITS.reduce((sum, p) => sum + board[p], 0);
      board[PLAYER_TWO_STORE] += remainingP2;
      PLAYER_TWO_PITS.forEach(p => board[p] = 0);

      if(board[PLAYER_ONE_STORE] > board[PLAYER_TWO_STORE]) {
        winner = Player.One;
        message = "PLAYER 1 WINS!";
      } else if (board[PLAYER_TWO_STORE] > board[PLAYER_ONE_STORE]) {
        winner = Player.Two;
        message = "PLAYER 2 WINS!";
      } else {
        winner = 'tie';
        message = "IT'S A TIE!";
      }
    }

    if (!gameOver && lastStonePit !== ownStore) {
       message = `PLAYER ${currentPlayer} TURN`;
       playSound('turn');

       // Add turn transition effect
       setGameState({
         board,
         currentPlayer,
         gameOver,
         winner,
         message: `PLAYER ${currentPlayer} TURN`,
         playerTwoTurn: currentPlayer === Player.Two,
         captureTurn: lastStonePit === (isPlayerOne ? PLAYER_ONE_STORE : PLAYER_TWO_STORE)
       });

       // Clear turn transition after a short delay
       setTimeout(() => {
         setGameState({
           board,
           currentPlayer,
           gameOver,
           winner,
           message: `PLAYER ${currentPlayer} TURN`,
           playerTwoTurn: false
         });
       }, 150);
    }

    setGameState({ board, currentPlayer, gameOver, winner, message });

  }, [gameState, playSound]);

  return { gameState, sowSeeds, resetGame, animatingPits, highlightedPit, captureEffect };
};