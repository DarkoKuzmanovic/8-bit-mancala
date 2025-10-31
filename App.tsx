import React, { useState } from "react";
import StartScreen from "./components/StartScreen";
import GameBoard from "./components/GameBoard";
import { useGameLogic } from "./hooks/useGameLogic";
import { useSocketGame } from "./hooks/useSocketGame";
import { useSound } from "./hooks/useSound";
import { Player } from "./types";

type GameMode = 'menu' | 'local' | 'online';

const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>('menu');

  // Local game state
  const { gameState: localGameState, sowSeeds: localSowSeeds, resetGame: localResetGame, animatingPits, highlightedPit, captureEffect } = useGameLogic();

  // Online game state
  const { gameState: onlineGameState, roomCode, playerNumber, playerCount, message, error, isConnected, connectionError, createRoom, joinRoom, makeMove, resetGame: onlineResetGame } = useSocketGame();

  const playSound = useSound();

  const handleStartLocalGame = () => {
    playSound('click');
    setGameMode('local');
  };

  const handleStartOnlineGame = () => {
    playSound('click');
    setGameMode('online');
  };

  const handleGoHome = () => {
    playSound('click');
    setGameMode('menu');
    localResetGame();
  };

  const handlePlayAgain = () => {
    playSound('click');
    if (gameMode === 'local') {
      localResetGame();
    } else {
      onlineResetGame();
    }
  };

  // Determine which game state to use
  const isOnlineReady = gameMode === 'online' && onlineGameState && playerCount === 2;
  const gameState = gameMode === 'local' ? localGameState : onlineGameState;
  const onMakeMove = gameMode === 'local' ? localSowSeeds : makeMove;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl md:text-5xl text-amber-200 mb-2 tracking-tighter drop-shadow-lg">8-BIT MANCALA</h1>
      <p className="status-banner inline-flex items-center justify-center text-[10px] md:text-xs text-orange-200 tracking-tight uppercase mb-8">
        {gameMode === 'menu' && 'ANCIENT AFRICAN STRATEGY GAME'}
        {gameMode === 'local' && 'LOCAL TWO-PLAYER'}
        {gameMode === 'online' && 'ONLINE MULTIPLAYER'}
      </p>

      {gameMode === 'menu' && (
        <div className="w-full max-w-lg pixelated-border board-surface p-8 flex flex-col space-y-6">
          <div>
            <h2 className="text-2xl text-orange-200 mb-4">SELECT GAME MODE</h2>
            <p className="text-amber-100 mb-6 text-sm">Choose how you want to play!</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleStartLocalGame}
              className="w-full px-6 py-3 text-lg bg-amber-500 text-amber-950 hover:bg-amber-400 active:bg-amber-600 transform hover:-translate-y-[2px] active:translate-y-[1px] transition-transform font-bold border-4 border-amber-700 pixel-shadow"
            >
              🎮 LOCAL GAME
            </button>
            <button
              onClick={handleStartOnlineGame}
              className="w-full px-6 py-3 text-lg bg-orange-600 text-amber-50 hover:bg-orange-500 active:bg-orange-700 transform hover:-translate-y-[2px] active:translate-y-[1px] transition-transform font-bold border-4 border-orange-800 pixel-shadow"
            >
              🌐 ONLINE GAME
            </button>
          </div>

          <div className="space-y-2 text-left">
            <p className="text-amber-200 text-sm">📖 HOW TO PLAY:</p>
            <p className="text-stone-200 text-xs">• Click your pits to sow stones clockwise</p>
            <p className="text-stone-200 text-xs">• Land in your store to go again</p>
            <p className="text-stone-200 text-xs">• Capture opponent's stones strategically</p>
            <p className="text-stone-200 text-xs">• Player with most stones wins!</p>
          </div>
        </div>
      )}

      {gameMode === 'online' && !isOnlineReady && (
        <StartScreen
          onCreateGame={createRoom}
          onJoinGame={joinRoom}
          roomCode={roomCode}
          message={message}
          error={error}
          isConnected={isConnected}
          connectionError={connectionError}
        />
      )}

      {((gameMode === 'local' && gameState) || (gameMode === 'online' && isOnlineReady && gameState)) && (
        <GameBoard
          gameState={gameState}
          playerNumber={gameMode === 'local' ? gameState.currentPlayer : playerNumber}
          animatingPits={animatingPits}
          highlightedPit={highlightedPit}
          captureEffect={captureEffect}
          onMakeMove={onMakeMove}
          onGoHome={handleGoHome}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
};

export default App;
