import React, { useState } from 'react';
import { useSound } from '../hooks/useSound';

interface StartScreenProps {
  onCreateGame: () => void;
  onJoinGame: (code: string) => void;
  roomCode: string | null;
  message: string;
  error: string | null;
  isConnected?: boolean;
  connectionError?: boolean;
}

const PixelButton: React.FC<{ onClick: () => void, children: React.ReactNode, className?: string, disabled?: boolean }> = ({ onClick, children, className, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-6 py-3 text-lg bg-amber-500 text-amber-950 hover:bg-amber-400 active:bg-amber-600 transform hover:-translate-y-[2px] active:translate-y-[1px] transition-transform border-4 border-amber-700 pixel-shadow disabled:bg-stone-600 disabled:border-stone-800 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);

const StartScreen: React.FC<StartScreenProps> = ({ onCreateGame, onJoinGame, roomCode, message, error, isConnected = false, connectionError = false }) => {
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const playSound = useSound();

  const handleCreate = () => {
    playSound('click');
    onCreateGame();
  };

  const handleJoin = () => {
    playSound('click');
    onJoinGame(joinCodeInput);
  };

  const handleCopyCode = async () => {
    if (roomCode) {
      try {
        await navigator.clipboard.writeText(roomCode);
        setCopied(true);
        playSound('click');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="w-full max-w-lg pixelated-border board-surface p-8 flex flex-col space-y-6">
      {/* Connection Status Indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <p className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
          {isConnected ? '● ONLINE' : '● OFFLINE'}
        </p>
      </div>

      <div className="flex items-center justify-center">
        <div className={`status-banner text-[10px] md:text-xs uppercase ${error || connectionError ? 'text-red-300 border-red-500' : 'text-amber-50 animate-pulse'}`}>
          {message}
        </div>
      </div>

      {connectionError && (
        <div className="bg-red-900/50 border-2 border-red-600 p-4 rounded-lg">
          <p className="text-red-300 text-sm font-bold mb-2">⚠️ SERVER NOT RUNNING</p>
          <p className="text-stone-200 text-xs mb-2">To start the server, run in a terminal:</p>
          <code className="block bg-amber-950 text-amber-200 p-2 text-xs rounded border-2 border-amber-800">
            npm run server
          </code>
          <p className="text-stone-200 text-xs mt-2">Or run both server and client:</p>
          <code className="block bg-amber-950 text-amber-200 p-2 text-xs rounded border-2 border-amber-800">
            npm start
          </code>
        </div>
      )}

      {roomCode ? (
         <div className="space-y-4">
            <h2 className="text-2xl text-orange-300 mb-4 animate-pulse">GAME CREATED!</h2>
            <p className="text-amber-200 mb-2">SHARE THIS CODE WITH YOUR OPPONENT:</p>
            <div className="relative">
              <div className="bg-amber-950 text-amber-200 p-6 text-3xl tracking-widest text-center font-bold border-4 border-amber-600 shadow-lg">
                {roomCode}
              </div>
              <button
                onClick={handleCopyCode}
                className="absolute -top-3 -right-3 bg-orange-600 hover:bg-orange-500 text-amber-50 text-xs px-3 py-2 rounded-full shadow-lg transform hover:scale-110 transition-transform border-2 border-orange-800"
              >
                {copied ? '✓ COPIED!' : '📋 COPY'}
              </button>
            </div>
            <div className="bg-amber-950/60 p-4 rounded-lg border-2 border-orange-600">
              <p className="text-orange-300 text-sm animate-pulse">
                ⏳ Waiting for opponent to join...
              </p>
            </div>
            <div className="space-y-2 text-left">
              <p className="text-amber-200 text-sm">📱 HOW TO PLAY:</p>
              <p className="text-stone-200 text-xs">1. Share the code above with a friend</p>
              <p className="text-stone-200 text-xs">2. They enter the code on their device</p>
              <p className="text-stone-200 text-xs">3. Game starts automatically when both players are ready</p>
            </div>
          </div>
      ) : (
        <>
          <div>
            <h2 className="text-2xl text-orange-300 mb-4">CREATE GAME</h2>
            <PixelButton onClick={handleCreate} className="w-full" disabled={!isConnected}>
              {isConnected ? 'CREATE NEW GAME' : 'SERVER OFFLINE'}
            </PixelButton>
          </div>
          <div className="text-center text-amber-400">-- OR --</div>
          <div>
            <h2 className="text-2xl text-orange-400 mb-4">JOIN GAME</h2>
            <input
              type="text"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              placeholder="ENTER CODE..."
              disabled={!isConnected}
              className="w-full bg-amber-950 text-amber-200 p-4 text-2xl tracking-widest text-center mb-4 placeholder-stone-500 focus:outline-none focus:ring-4 focus:ring-orange-600 border-4 border-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={8}
            />
            <PixelButton onClick={handleJoin} disabled={!joinCodeInput || !isConnected} className="w-full bg-orange-600 hover:bg-orange-500 active:bg-orange-700 border-orange-800">
              {isConnected ? 'JOIN GAME' : 'SERVER OFFLINE'}
            </PixelButton>
          </div>
        </>
      )}
    </div>
  );
};

export default StartScreen;
