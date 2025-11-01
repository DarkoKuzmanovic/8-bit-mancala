import { useState, useEffect, useRef, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import { GameState, Player } from '../types';

// This tells TypeScript that the `io` function is available globally,
// since it's included from a <script> tag in index.html.
declare const io: any;

// NOTE: Auto-detect server URL based on environment
const SERVER_URL = import.meta.env.DEV
  ? 'http://localhost:3002'
  : window.location.origin;

export const useSocketGame = () => {
  const socketRef = useRef<Socket | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerNumber, setPlayerNumber] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [message, setMessage] = useState('Connecting to server...');
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<boolean>(false);

  useEffect(() => {
    console.log('Initializing Socket.IO connection to:', SERVER_URL);
    const socketOptions: any = {
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 5000,
    };

    // In production, use the custom socket.io path
    if (!import.meta.env.DEV) {
      socketOptions.path = '/8-bit-mancala/socket.io';
    }

    const socket: Socket = io(SERVER_URL, socketOptions);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to server with id:', socket.id);
      setIsConnected(true);
      setConnectionError(false);
      setMessage('Connected! Ready to play.');
      setError(null);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Connection error:', err.message);
      setIsConnected(false);
      setConnectionError(true);
      setMessage('Cannot connect to server. Please start the server first.');
      setError('Server offline. Run: npm run server');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      setIsConnected(false);
      setMessage('Disconnected from server');
    });

    socket.on('roomCreated', ({ roomCode, gameState, playerNumber, playerCount }: { roomCode: string, gameState: GameState, playerNumber: Player, playerCount: number }) => {
      setRoomCode(roomCode);
      setGameState(gameState);
      setPlayerNumber(playerNumber);
      setPlayerCount(playerCount);
      setMessage(`ROOM CREATED! WAITING FOR OPPONENT... (${playerCount}/2 players)`);
      setError(null);
    });

    socket.on('joinedRoom', ({ roomCode, gameState, playerNumber, playerCount }: { roomCode: string, gameState: GameState, playerNumber: Player, playerCount: number }) => {
        console.log('joinedRoom event received:', { roomCode, playerNumber, playerCount });
        setRoomCode(roomCode);
        setGameState(gameState);
        setPlayerNumber(playerNumber);
        setPlayerCount(playerCount);
        setMessage('JOINED ROOM! GAME STARTING.');
        setError(null);
    });

    socket.on('gameStarting', ({ roomCode, playerCount }: { roomCode: string, playerCount: number }) => {
        console.log('gameStarting event received:', { roomCode, playerCount });
        setPlayerCount(playerCount);
        setMessage('OPPONENT JOINED! GAME STARTING...');
    });
    
    socket.on('gameUpdate', (newGameState: GameState) => {
      setGameState(newGameState);
      setError(null);
    });

    socket.on('errorMessage', (errorMessage: string) => {
        setError(errorMessage);
        setMessage(errorMessage);
        // If we get an error trying to join, clear the room code
        if (!gameState) {
          setRoomCode(null);
        }
    });

    socket.on('opponentDisconnected', () => {
        setMessage('OPPONENT DISCONNECTED.');
        setGameState(prev => prev ? {...prev, gameOver: true, winner: playerNumber, message: 'OPPONENT LEFT.'} : null);
    });

    return () => {
      socket.disconnect();
    };
    // The empty dependency array ensures this effect runs only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createRoom = useCallback(() => {
    socketRef.current?.emit('createRoom');
  }, []);

  const joinRoom = useCallback((code: string) => {
    if (code) {
      console.log('Emitting joinRoom with code:', code);
      socketRef.current?.emit('joinRoom', { roomCode: code });
    }
  }, []);

  const makeMove = useCallback((pitIndex: number) => {
    console.log('makeMove called:', { pitIndex, roomCode });
    socketRef.current?.emit('makeMove', { roomCode, pitIndex });
  }, [roomCode]);

  const resetGame = useCallback(() => {
     socketRef.current?.emit('resetGame', { roomCode });
  }, [roomCode]);

  return { gameState, roomCode, playerNumber, playerCount, message, error, isConnected, connectionError, createRoom, joinRoom, makeMove, resetGame };
};
