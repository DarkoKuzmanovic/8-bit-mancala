import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3002;
const BASE_PATH = normalizeBasePath(process.env.BASE_PATH || '');
const STATIC_DIR = path.join(__dirname, 'dist');
const SOCKET_PATH = `${BASE_PATH || ''}/socket.io`.replace(/\/{2,}/g, '/');

function normalizeBasePath(value) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') {
    return '';
  }
  const withoutExtraSlashes = trimmed.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
  return `/${withoutExtraSlashes}`;
}

// Game constants
const INITIAL_STONES_PER_PIT = 4;
const PLAYER_ONE_PITS = [0, 1, 2, 3, 4, 5];
const PLAYER_TWO_PITS = [7, 8, 9, 10, 11, 12];
const PLAYER_ONE_STORE = 6;
const PLAYER_TWO_STORE = 13;

const INITIAL_BOARD = [
  INITIAL_STONES_PER_PIT, INITIAL_STONES_PER_PIT, INITIAL_STONES_PER_PIT, INITIAL_STONES_PER_PIT, INITIAL_STONES_PER_PIT, INITIAL_STONES_PER_PIT,
  0, // Player 1 Store
  INITIAL_STONES_PER_PIT, INITIAL_STONES_PER_PIT, INITIAL_STONES_PER_PIT, INITIAL_STONES_PER_PIT, INITIAL_STONES_PER_PIT, INITIAL_STONES_PER_PIT,
  0, // Player 2 Store
];

// Game state storage
const games = new Map(); // roomCode -> gameState
const rooms = new Map(); // roomCode -> { player1Socket, player2Socket, playerCount }

// Helper functions
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function createInitialState() {
  return {
    board: [...INITIAL_BOARD],
    currentPlayer: 1, // Player.One
    gameOver: false,
    winner: null,
    message: 'PLAYER 1 TURN',
  };
}

function makeMove(gameState, pitIndex, playerNumber) {
  if (gameState.gameOver) return null;

  let board = [...gameState.board];
  let currentPlayer = gameState.currentPlayer;
  let message = gameState.message;

  // Validate move
  const isPlayerOne = playerNumber === 1;
  if ((isPlayerOne && !PLAYER_ONE_PITS.includes(pitIndex)) || (!isPlayerOne && !PLAYER_TWO_PITS.includes(pitIndex))) {
    return null; // Not player's pit
  }
  if (board[pitIndex] === 0) {
    return null; // Empty pit
  }

  let stones = board[pitIndex];
  board[pitIndex] = 0;

  let currentIndex = pitIndex;
  const opponentStore = isPlayerOne ? PLAYER_TWO_STORE : PLAYER_ONE_STORE;

  while (stones > 0) {
    currentIndex = (currentIndex + 1) % 14;
    if (currentIndex === opponentStore) continue;

    board[currentIndex]++;
    stones--;
  }

  // Check game rules after sowing
  const lastStonePit = currentIndex;
  const ownStore = isPlayerOne ? PLAYER_ONE_STORE : PLAYER_TWO_STORE;

  // Rule 1: Go again
  if (lastStonePit === ownStore) {
    message = `PLAYER ${playerNumber} GOES AGAIN!`;
  }
  // Rule 2: Capture
  else if (board[lastStonePit] === 1 && (isPlayerOne ? PLAYER_ONE_PITS : PLAYER_TWO_PITS).includes(lastStonePit)) {
    const oppositePit = 12 - lastStonePit;
    if (board[oppositePit] > 0) {
      const capturedStones = board[oppositePit] + 1;
      board[oppositePit] = 0;
      board[lastStonePit] = 0;
      board[ownStore] += capturedStones;
      message = `PLAYER ${playerNumber} CAPTURED ${capturedStones} STONES!`;
      currentPlayer = isPlayerOne ? 2 : 1; // Switch turn after capture
    } else {
       currentPlayer = isPlayerOne ? 2 : 1; // Switch turn
    }
  }
  // Default: Switch turn
  else {
    currentPlayer = isPlayerOne ? 2 : 1;
  }

  // Check for Game Over
  const playerOnePitsEmpty = PLAYER_ONE_PITS.every(p => board[p] === 0);
  const playerTwoPitsEmpty = PLAYER_TWO_PITS.every(p => board[p] === 0);

  let gameOver = false;
  let winner = null;

  if (playerOnePitsEmpty || playerTwoPitsEmpty) {
    gameOver = true;

    const remainingP1 = PLAYER_ONE_PITS.reduce((sum, p) => sum + board[p], 0);
    board[PLAYER_ONE_STORE] += remainingP1;
    PLAYER_ONE_PITS.forEach(p => board[p] = 0);

    const remainingP2 = PLAYER_TWO_PITS.reduce((sum, p) => sum + board[p], 0);
    board[PLAYER_TWO_STORE] += remainingP2;
    PLAYER_TWO_PITS.forEach(p => board[p] = 0);

    if(board[PLAYER_ONE_STORE] > board[PLAYER_TWO_STORE]) {
      winner = 1;
      message = "PLAYER 1 WINS!";
    } else if (board[PLAYER_TWO_STORE] > board[PLAYER_ONE_STORE]) {
      winner = 2;
      message = "PLAYER 2 WINS!";
    } else {
      winner = 'tie';
      message = "IT'S A TIE!";
    }
  }

  if (!gameOver && lastStonePit !== ownStore) {
     message = `PLAYER ${currentPlayer} TURN`;
  }

  return { board, currentPlayer, gameOver, winner, message };
}

// Create Express app and HTTP server
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  path: SOCKET_PATH,
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "https://app.quz.ma"],
    methods: ["GET", "POST"]
  }
});

// Serve static files
if (BASE_PATH) {
  app.use(BASE_PATH, express.static(STATIC_DIR));
  app.get('/', (_req, res) => {
    res.redirect(BASE_PATH);
  });
} else {
  app.use(express.static(STATIC_DIR));
}

// Health check endpoints
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

if (BASE_PATH) {
  app.get(`${BASE_PATH}/health`, (_req, res) => {
    res.json({ ok: true });
  });
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createRoom', () => {
    let roomCode;
    do {
      roomCode = generateRoomCode();
    } while (rooms.has(roomCode));

    const room = {
      player1Socket: socket.id,
      player2Socket: null,
      playerCount: 1
    };

    rooms.set(roomCode, room);
    games.set(roomCode, createInitialState());

    socket.join(roomCode);
    socket.emit('roomCreated', {
      roomCode,
      gameState: games.get(roomCode),
      playerNumber: 1,
      playerCount: 1
    });

    console.log(`Room ${roomCode} created by ${socket.id}`);
  });

  socket.on('joinRoom', (data) => {
    console.log('joinRoom event received:', data);
    const { roomCode } = data;
    const room = rooms.get(roomCode);

    if (!room) {
      socket.emit('errorMessage', 'Room not found!');
      return;
    }

    if (room.playerCount >= 2) {
      socket.emit('errorMessage', 'Room is full!');
      return;
    }

    room.player2Socket = socket.id;
    room.playerCount = 2;

    socket.join(roomCode);
    socket.emit('joinedRoom', {
      roomCode,
      gameState: games.get(roomCode),
      playerNumber: 2,
      playerCount: 2
    });

    // Notify the room creator that game is starting
    io.to(room.player1Socket).emit('gameStarting', {
      roomCode,
      playerCount: 2
    });

    // Send game state to both players
    const gameState = games.get(roomCode);
    io.to(room.player1Socket).emit('gameUpdate', gameState);
    io.to(room.player2Socket).emit('gameUpdate', gameState);

    console.log(`Player ${socket.id} joined room ${roomCode}`);
  });

  socket.on('makeMove', (data) => {
    console.log('makeMove event received:', data);
    const { roomCode, pitIndex } = data;
    const room = rooms.get(roomCode);
    const gameState = games.get(roomCode);

    if (!room || !gameState) {
      socket.emit('errorMessage', 'Invalid room!');
      return;
    }

    // Determine which player is making the move
    const playerNumber = socket.id === room.player1Socket ? 1 : 2;

    // Check if it's the player's turn
    if (gameState.currentPlayer !== playerNumber) {
      socket.emit('errorMessage', 'Not your turn!');
      return;
    }

    // Make the move
    const newGameState = makeMove(gameState, pitIndex, playerNumber);

    if (!newGameState) {
      socket.emit('errorMessage', 'Invalid move!');
      return;
    }

    // Update game state
    games.set(roomCode, newGameState);

    // Broadcast new game state to both players
    io.to(roomCode).emit('gameUpdate', newGameState);

    console.log(`Move made in room ${roomCode} by player ${playerNumber}, pit ${pitIndex}`);
  });

  socket.on('resetGame', (data) => {
    const { roomCode } = data;
    const room = rooms.get(roomCode);

    if (!room) {
      socket.emit('errorMessage', 'Invalid room!');
      return;
    }

    // Reset game state
    const newGameState = createInitialState();
    games.set(roomCode, newGameState);

    // Broadcast new game state to both players
    io.to(roomCode).emit('gameUpdate', newGameState);

    console.log(`Game reset in room ${roomCode}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Find the room this player was in
    for (const [roomCode, room] of rooms.entries()) {
      if (room.player1Socket === socket.id || room.player2Socket === socket.id) {
        // Notify the other player
        const otherPlayerSocket = room.player1Socket === socket.id ? room.player2Socket : room.player1Socket;
        if (otherPlayerSocket) {
          io.to(otherPlayerSocket).emit('opponentDisconnected');
        }

        // Clean up room
        rooms.delete(roomCode);
        games.delete(roomCode);

        console.log(`Room ${roomCode} cleaned up due to disconnection`);
        break;
      }
    }
  });
});

// Start server
httpServer.listen(PORT, () => {
  const pathInfo = BASE_PATH || '/';
  console.log(`🎮 8-Bit Mancala server running on http://localhost:${PORT}${pathInfo}`);
  console.log(`🔗 Socket.IO path set to ${SOCKET_PATH}`);
});