import React, { useState, useEffect } from "react";
import StartScreen from "./components/StartScreen";
import GameBoard from "./components/GameBoard";
import SoundSettingsPanel from "./components/SoundSettingsPanel";
import GameStats from "./components/GameStats";
import AccessibilitySettingsPanel from "./components/AccessibilitySettingsPanel";
import { useGameLogic } from "./hooks/useGameLogic";
import { useSocketGame } from "./hooks/useSocketGame";
import { useSound } from "./hooks/useSound";
import { useSoundSettings } from "./hooks/useSoundSettings";
import { useGameStats } from "./hooks/useGameStats";
import { useAccessibilitySettings } from "./hooks/useAccessibilitySettings";
import { Player } from "./types";

type GameMode = 'menu' | 'local' | 'online';

const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);

  // Stats tracking
  const { recordGame } = useGameStats();

  // Accessibility settings (applied automatically)
  useAccessibilitySettings();

  // Local game state
  const { gameState: localGameState, sowSeeds: localSowSeeds, resetGame: localResetGame, undoMove: localUndoMove, canUndo: localCanUndo, animatingPits, highlightedPit, captureEffect } = useGameLogic();

  // Online game state
  const { gameState: onlineGameState, roomCode, playerNumber, playerCount, message, error, isConnected, connectionError, createRoom, joinRoom, makeMove, resetGame: onlineResetGame } = useSocketGame();

  const playSound = useSound();
  const { settings: soundSettings, toggleMute } = useSoundSettings();

  // Record game completion in stats (for local games only)
  useEffect(() => {
    if (gameMode === 'local' && localGameState?.gameOver && localGameState?.winner !== null) {
      recordGame(localGameState.winner);
    }
  }, [gameMode, localGameState?.gameOver, localGameState?.winner, recordGame]);

  const handleStartLocalGame = () => {
    playSound('click');
    playSound('gameStart');
    setGameMode('local');
  };

  const handleStartOnlineGame = () => {
    playSound('click');
    playSound('gameStart');
    setGameMode('online');
  };

  const handleSoundSettings = () => {
    playSound('menuNavigate');
    setShowSoundSettings(true);
  };

  const handleStats = () => {
    playSound('menuNavigate');
    setShowStats(true);
  };

  const handleAccessibility = () => {
    playSound('menuNavigate');
    setShowAccessibility(true);
  };

  const handleGoHome = () => {
    playSound('menuNavigate');
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
              className="w-full px-6 py-3 text-lg bg-amber-500 text-amber-950 transform font-bold border-4 border-amber-700 pixel-button pixel-shadow"
            >
              🎮 LOCAL GAME
            </button>
            <button
              onClick={handleStartOnlineGame}
              className="w-full px-6 py-3 text-lg bg-orange-600 text-amber-50 transform font-bold border-4 border-orange-800 pixel-button pixel-shadow"
            >
              🌐 ONLINE GAME
            </button>
            <button
              onClick={handleSoundSettings}
              className="w-full px-6 py-3 text-lg bg-purple-600 text-amber-50 transform font-bold border-4 border-purple-800 pixel-button pixel-shadow"
            >
              🔊 SOUND SETTINGS
            </button>
            <button
              onClick={handleStats}
              className="w-full px-6 py-3 text-lg bg-blue-600 text-amber-50 transform font-bold border-4 border-blue-800 pixel-button pixel-shadow"
            >
              📊 GAME STATS
            </button>
            <button
              onClick={handleAccessibility}
              className="w-full px-6 py-3 text-lg bg-indigo-600 text-amber-50 transform font-bold border-4 border-indigo-800 pixel-button pixel-shadow"
            >
              ♿ ACCESSIBILITY
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
          onUndoMove={gameMode === 'local' ? localUndoMove : undefined}
          canUndo={gameMode === 'local' ? localCanUndo : false}
        />
      )}

      {/* Sound Settings Modal */}
      <SoundSettingsPanel
        isOpen={showSoundSettings}
        onClose={() => setShowSoundSettings(false)}
      />

      {/* Game Stats Modal */}
      <GameStats
        isOpen={showStats}
        onClose={() => setShowStats(false)}
      />

      {/* Accessibility Settings Modal */}
      <AccessibilitySettingsPanel
        isOpen={showAccessibility}
        onClose={() => setShowAccessibility(false)}
      />
    </div>
  );
};

export default App;
