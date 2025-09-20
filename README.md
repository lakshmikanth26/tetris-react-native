# Tetris Game - React Native Expo

A fully playable Tetris game built with React Native and Expo. This game runs directly in Expo Go without ejecting.

## Features

- **Complete Tetris Gameplay**: All 7 tetromino shapes (I, J, L, O, S, T, Z) with proper rotation
- **Game Mechanics**: 
  - Line clearing when rows are filled
  - Score tracking with level progression
  - Increasing speed as levels advance
  - Ghost piece preview showing where the piece will land
- **Controls**: 
  - Touch buttons for Left, Right, Rotate, and Hard Drop
  - Pause/Resume functionality
- **UI/UX**: 
  - Modern dark theme with colorful tetrominoes
  - Score, level, and lines cleared display
  - Next piece preview
  - Game over screen with restart option

## How to Run

1. **Install Expo CLI** (if you haven't already):
   ```bash
   npm install -g @expo/cli
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on your device**:
   - Install the Expo Go app on your iOS or Android device
   - Scan the QR code displayed in your terminal or browser
   - The game will load directly in Expo Go

## Game Controls

- **Left Arrow (←)**: Move piece left
- **Right Arrow (→)**: Move piece right  
- **Rotate (↻)**: Rotate piece clockwise
- **Drop**: Hard drop piece to bottom
- **Pause**: Pause/resume the game

## Game Rules

- **Scoring**: 
  - 1 line: 40 × (level + 1) points
  - 2 lines: 100 × (level + 1) points  
  - 3 lines: 300 × (level + 1) points
  - 4 lines (Tetris): 1200 × (level + 1) points

- **Levels**: Advance every 10 lines cleared
- **Speed**: Increases with each level (starts at 1000ms, minimum 50ms)

## Technical Details

- **Framework**: React Native with Expo SDK 49
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Game Logic**: Separated from UI in `gameLogic.js`
- **Rendering**: Pure React Native components (no external game engines)
- **Performance**: Optimized with proper memoization and efficient re-renders

## Project Structure

```
├── App.js              # Main game component with UI
├── gameLogic.js        # Core Tetris game logic
├── app.json           # Expo configuration
├── package.json       # Dependencies and scripts
└── assets/           # App icons and splash screens
```

## Development

The game logic is completely separated from the UI, making it easy to:
- Add new features
- Modify game rules
- Change the visual design
- Add sound effects or animations

All game state is managed through React hooks, and the game loop uses `setInterval` for automatic piece falling with level-based speed adjustments.

## Compatibility

- ✅ iOS (Expo Go)
- ✅ Android (Expo Go)  
- ✅ Web (Expo for Web)
- ✅ No ejecting required
- ✅ Works with Expo SDK 49+

Enjoy playing Tetris! 🎮
