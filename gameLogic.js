// Tetris Game Logic
// This file contains all the core game mechanics for Tetris

// Game constants
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const EMPTY_CELL = 0;

// Tetromino shapes - each shape has 4 rotation states
export const TETROMINOES = {
  I: {
    shape: [
      [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
      [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
      [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
      [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]
    ],
    color: '#00f0f0'
  },
  J: {
    shape: [
      [[1,0,0], [1,1,1], [0,0,0]],
      [[0,1,1], [0,1,0], [0,1,0]],
      [[0,0,0], [1,1,1], [0,0,1]],
      [[0,1,0], [0,1,0], [1,1,0]]
    ],
    color: '#0000f0'
  },
  L: {
    shape: [
      [[0,0,1], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,0], [0,1,1]],
      [[0,0,0], [1,1,1], [1,0,0]],
      [[1,1,0], [0,1,0], [0,1,0]]
    ],
    color: '#f0a000'
  },
  O: {
    shape: [
      [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
      [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
      [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
      [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]]
    ],
    color: '#f0f000'
  },
  S: {
    shape: [
      [[0,1,1], [1,1,0], [0,0,0]],
      [[0,1,0], [0,1,1], [0,0,1]],
      [[0,0,0], [0,1,1], [1,1,0]],
      [[1,0,0], [1,1,0], [0,1,0]]
    ],
    color: '#00f000'
  },
  T: {
    shape: [
      [[0,1,0], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,1], [0,1,0]],
      [[0,0,0], [1,1,1], [0,1,0]],
      [[0,1,0], [1,1,0], [0,1,0]]
    ],
    color: '#a000f0'
  },
  Z: {
    shape: [
      [[1,1,0], [0,1,1], [0,0,0]],
      [[0,0,1], [0,1,1], [0,1,0]],
      [[0,0,0], [1,1,0], [0,1,1]],
      [[0,1,0], [1,1,0], [1,0,0]]
    ],
    color: '#f00000'
  }
};

// Get random tetromino
export const getRandomTetromino = () => {
  const tetrominoTypes = Object.keys(TETROMINOES);
  const randomType = tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)];
  return {
    type: randomType,
    shape: TETROMINOES[randomType].shape[0],
    color: TETROMINOES[randomType].color,
    x: Math.floor(BOARD_WIDTH / 2) - 1,
    y: 0,
    rotation: 0
  };
};

// Create empty board
export const createEmptyBoard = () => {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL));
};

// Check if a position is valid for a tetromino
export const isValidPosition = (board, tetromino, newX, newY, newRotation = tetromino.rotation) => {
  const shape = TETROMINOES[tetromino.type].shape[newRotation];
  
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== 0) {
        const boardX = newX + x;
        const boardY = newY + y;
        
        // Check boundaries
        if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
          return false;
        }
        
        // Check collision with existing pieces (but allow negative Y for spawning)
        if (boardY >= 0 && board[boardY][boardX] !== EMPTY_CELL) {
          return false;
        }
      }
    }
  }
  return true;
};

// Place tetromino on board
export const placeTetromino = (board, tetromino) => {
  const newBoard = board.map(row => [...row]);
  const shape = TETROMINOES[tetromino.type].shape[tetromino.rotation];
  
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== 0) {
        const boardX = tetromino.x + x;
        const boardY = tetromino.y + y;
        
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = tetromino.color;
        }
      }
    }
  }
  return newBoard;
};

// Check for completed lines
export const getCompletedLines = (board) => {
  const completedLines = [];
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    if (board[y].every(cell => cell !== EMPTY_CELL)) {
      completedLines.push(y);
    }
  }
  return completedLines;
};

// Clear completed lines
export const clearLines = (board, completedLines) => {
  let newBoard = board.filter((_, index) => !completedLines.includes(index));
  
  // Add empty lines at the top
  const emptyLines = completedLines.length;
  for (let i = 0; i < emptyLines; i++) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(EMPTY_CELL));
  }
  
  return newBoard;
};

// Calculate score based on lines cleared
export const calculateScore = (linesCleared, level) => {
  const baseScores = [0, 40, 100, 300, 1200]; // 0, 1, 2, 3, 4 lines
  return baseScores[linesCleared] * (level + 1);
};

// Calculate level based on total lines cleared
export const calculateLevel = (totalLinesCleared) => {
  return Math.floor(totalLinesCleared / 10);
};

// Calculate drop speed based on level
export const getDropSpeed = (level) => {
  return Math.max(50, 1000 - (level * 50)); // Minimum 50ms, starts at 1000ms
};

// Move tetromino
export const moveTetromino = (board, tetromino, direction) => {
  let newX = tetromino.x;
  let newY = tetromino.y;
  
  switch (direction) {
    case 'left':
      newX = tetromino.x - 1;
      break;
    case 'right':
      newX = tetromino.x + 1;
      break;
    case 'down':
      newY = tetromino.y + 1;
      break;
  }
  
  if (isValidPosition(board, tetromino, newX, newY)) {
    return { ...tetromino, x: newX, y: newY };
  }
  
  return tetromino;
};

// Rotate tetromino
export const rotateTetromino = (board, tetromino) => {
  const newRotation = (tetromino.rotation + 1) % 4;
  
  if (isValidPosition(board, tetromino, tetromino.x, tetromino.y, newRotation)) {
    return {
      ...tetromino,
      rotation: newRotation,
      shape: TETROMINOES[tetromino.type].shape[newRotation]
    };
  }
  
  return tetromino;
};

// Hard drop tetromino
export const hardDrop = (board, tetromino) => {
  let newY = tetromino.y;
  
  while (isValidPosition(board, tetromino, tetromino.x, newY + 1)) {
    newY++;
  }
  
  return { ...tetromino, y: newY };
};

// Check if game is over
export const isGameOver = (board, tetromino) => {
  return !isValidPosition(board, tetromino, tetromino.x, tetromino.y);
};

// Get ghost piece position (preview of where piece will land)
export const getGhostPiece = (board, tetromino) => {
  return hardDrop(board, tetromino);
};
