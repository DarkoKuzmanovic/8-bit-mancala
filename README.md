# 🎮 8-Bit Mancala

A multiplayer Mancala game with a retro 8-bit vibe. Challenge friends in this classic African strategy game featuring nostalgic sound effects and pixelated graphics.

## 🎯 Features

- **Local Multiplayer**: Play against a friend on the same device
- **Online Multiplayer**: Create or join games with invitation codes
- **Retro Sound Effects**: Authentic 8-bit audio using Web Audio API
- **Pixelated Visual Design**: Retro-inspired UI with custom animations
- **Real-time Game State**: Synchronized gameplay across connected players
- **Turn Indicators**: Clear visual cues for whose turn it is
- **Capture Effects**: Animated feedback for stone captures
- **Game Over Modal**: End-game screen with win/tie results

## 🏗️ Project Structure

```
8-bit-mancala/
├── components/                 # React components
│   ├── GameBoard.tsx         # Main game board layout
│   ├── Pit.tsx                # Individual pit with stones
│   ├── Store.tsx               # Player stores
│   ├── PlayerIndicator.tsx    # Turn indicators
│   ├── GameOverModal.tsx      # End game screen
│   └── StartScreen.tsx       # Online game lobby
├── hooks/                      # Custom React hooks
│   ├── useGameLogic.ts         # Local game rules and state
│   ├── useSocketGame.ts         # Online multiplayer logic
│   └── useSound.ts              # 8-bit audio effects
├── types.ts                    # TypeScript type definitions
├── constants.ts                 # Game constants and board configuration
├── App.tsx                      # Main application component
├── index.tsx                    # React entry point
├── server.js                    # Socket.IO game server
├── index.html                   # HTML template
├── index.css                    # Custom styles and animations
└── package.json                 # Project dependencies and scripts
```

## 🎲 Game Rules

Mancala is an ancient African strategy game with simple but deep gameplay:

### Board Setup
- 14 pits total (12 small pits + 2 stores)
- 4 stones in each small pit at start
- Stores start empty

### How to Play
1. **Select a Pit**: On your turn, choose one of your 6 pits
2. **Sow Stones**: Distribute stones counter-clockwise
3. **Special Rules**:
   - **Go Again**: Land your last stone in your own store
   - **Capture**: Land in an empty pit on your side, capture opponent's stones
3. **Win Condition**: Player with the most stones in their store wins

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables** (if using Gemini AI features):
   ```bash
   # Create .env.local file with:
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Start the game server** (in a separate terminal):
   ```bash
   npm run server
   ```

   Or run both server and client together:
   ```bash
   npm start
   ```

### Game Modes

#### 🎮 Local Game
- Play against a friend on the same device
- Take turns clicking your pits

#### 🌐 Online Game
- **Create Game**: Generate a unique room code
- **Join Game**: Enter an existing room code
- Real-time synchronization between players

## 🛠️ Technical Details

### Architecture
- **Frontend**: React 19 with TypeScript, Vite build tool
- **Backend**: Node.js with Socket.IO for real-time communication
- **Styling**: Tailwind CSS with custom pixelated borders and animations

### Key Components

#### [`useGameLogic.ts`](hooks/useGameLogic.ts:1) - Local Game Engine
- Implements Mancala game rules and state management
- Handles stone sowing, captures, and turn management
- Provides animation states for visual feedback

#### [`useSocketGame.ts`](hooks/useSocketGame.ts:1) - Online Multiplayer
- Manages Socket.IO connections and room management
- Synchronizes game state between connected players

#### [`server.js`](server.js:1) - Game Server
- Handles room creation and player matching
- Broadcasts game updates to all players in a room

### Sound System
- **Web Audio API**: Generates authentic 8-bit sound effects
- **Sound Types**:
  - `pickup`: Stone pickup sound
  - `drop`: Stone placement sound
- `capture`: Capture sequence audio
- `win`: Victory fanfare
- `turn`: Turn transition sound
- `click`: Button interaction sound

## 📁 File Reference

### Core Files
- [`App.tsx`](App.tsx:1) - Main application with game mode routing
- [`types.ts`](types.ts:1) - TypeScript interfaces and enums
- [`constants.ts`](constants.ts:1) - Board configuration and game constants

### Component Files
- [`components/GameBoard.tsx`](components/GameBoard.tsx:1) - Renders game layout with pits and stores
- [`components/Pit.tsx`](components/Pit.tsx:1) - Individual pit with stone rendering
- [`components/Store.tsx`](components/Store.tsx:1) - Player stores
- [`components/PlayerIndicator.tsx`](components/PlayerIndicator.tsx:1) - Turn indicator panels

## 🔧 Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run server` - Start game server (port 3002)

## 🎨 Styling & Theming

The game features a custom pixelated aesthetic with:
- **Wood Grain Background**: Authentic game board texture
- **Custom Animations**: Stone movement, capture effects, turn indicators
- **Responsive Design**: Works on desktop and mobile devices

## 🌐 Deployment

### Local Server Setup
For online multiplayer functionality, ensure the game server is running:

```bash
npm run server
```

The server will start on `http://localhost:3002`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

<div align="center">
Made with ❤️ and 🎮 retro vibes
</div>
