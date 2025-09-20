import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  EMPTY_CELL,
  createEmptyBoard,
  getRandomTetromino,
  isValidPosition,
  placeTetromino,
  getCompletedLines,
  clearLines,
  calculateScore,
  calculateLevel,
  getDropSpeed,
  moveTetromino,
  rotateTetromino,
  hardDrop,
  isGameOver,
  getGhostPiece,
  TETROMINOES
} from './gameLogic';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function App() {
  // Game state
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Initialize game
  const initializeGame = useCallback(() => {
    const newBoard = createEmptyBoard();
    const firstPiece = getRandomTetromino();
    const secondPiece = getRandomTetromino();
    
    setBoard(newBoard);
    setCurrentPiece(firstPiece);
    setNextPiece(secondPiece);
    setScore(0);
    setLevel(0);
    setLinesCleared(0);
    setGameOver(false);
    setGameStarted(true);
    setIsPaused(false);
  }, []);

  // Start new game
  const startNewGame = () => {
    initializeGame();
  };

  // Pause/Resume game
  const togglePause = () => {
    if (gameStarted && !gameOver) {
      setIsPaused(!isPaused);
    }
  };

  // Move piece
  const handleMove = useCallback((direction) => {
    if (!currentPiece || gameOver || isPaused) return;

    setCurrentPiece(prevPiece => {
      const newPiece = moveTetromino(board, prevPiece, direction);
      return newPiece;
    });
  }, [board, currentPiece, gameOver, isPaused]);

  // Rotate piece
  const handleRotate = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    setCurrentPiece(prevPiece => {
      const newPiece = rotateTetromino(board, prevPiece);
      return newPiece;
    });
  }, [board, currentPiece, gameOver, isPaused]);

  // Hard drop
  const handleHardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    setCurrentPiece(prevPiece => {
      const droppedPiece = hardDrop(board, prevPiece);
      return droppedPiece;
    });
  }, [board, currentPiece, gameOver, isPaused]);

  // Lock piece and spawn new one
  const lockPiece = useCallback(() => {
    if (!currentPiece) return;

    // Place piece on board
    const newBoard = placeTetromino(board, currentPiece);
    
    // Check for completed lines
    const completedLines = getCompletedLines(newBoard);
    let finalBoard = newBoard;
    
    if (completedLines.length > 0) {
      finalBoard = clearLines(newBoard, completedLines);
      
      // Update score and level
      const newScore = score + calculateScore(completedLines.length, level);
      const newLinesCleared = linesCleared + completedLines.length;
      const newLevel = calculateLevel(newLinesCleared);
      
      setScore(newScore);
      setLinesCleared(newLinesCleared);
      setLevel(newLevel);
    }
    
    setBoard(finalBoard);
    
    // Spawn next piece
    const newCurrentPiece = nextPiece;
    const newNextPiece = getRandomTetromino();
    
    // Check game over
    if (isGameOver(finalBoard, newCurrentPiece)) {
      setGameOver(true);
      setGameStarted(false);
      return;
    }
    
    setCurrentPiece(newCurrentPiece);
    setNextPiece(newNextPiece);
  }, [board, currentPiece, nextPiece, score, level, linesCleared]);

  // Game loop - handle automatic piece falling
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused || !currentPiece) return;

    const dropSpeed = getDropSpeed(level);
    
    const gameLoop = setInterval(() => {
      setCurrentPiece(prevPiece => {
        if (!prevPiece) return prevPiece;
        
        const movedPiece = moveTetromino(board, prevPiece, 'down');
        
        // If piece couldn't move down, lock it
        if (movedPiece.y === prevPiece.y) {
          setTimeout(() => lockPiece(), 0);
        }
        
        return movedPiece;
      });
    }, dropSpeed);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, isPaused, level, board, currentPiece, lockPiece]);

  // Render board with current piece
  const renderBoard = () => {
    // Create display board
    let displayBoard = board.map(row => [...row]);
    
    // Add current piece to display
    if (currentPiece) {
      // Add ghost piece (preview)
      const ghostPiece = getGhostPiece(board, currentPiece);
      const ghostShape = TETROMINOES[ghostPiece.type].shape[ghostPiece.rotation];
      
      for (let y = 0; y < ghostShape.length; y++) {
        for (let x = 0; x < ghostShape[y].length; x++) {
          if (ghostShape[y][x] !== 0) {
            const boardX = ghostPiece.x + x;
            const boardY = ghostPiece.y + y;
            
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              if (displayBoard[boardY][boardX] === EMPTY_CELL) {
                displayBoard[boardY][boardX] = 'ghost';
              }
            }
          }
        }
      }
      
      // Add current piece
      const shape = TETROMINOES[currentPiece.type].shape[currentPiece.rotation];
      
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x] !== 0) {
            const boardX = currentPiece.x + x;
            const boardY = currentPiece.y + y;
            
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }
    
    return displayBoard;
  };

  // Render next piece preview
  const renderNextPiece = () => {
    if (!nextPiece) return null;
    
    const shape = TETROMINOES[nextPiece.type].shape[0];
    const cellSize = 15;
    
    return (
      <View style={styles.nextPieceContainer}>
        <Text style={styles.nextPieceLabel}>Next:</Text>
        <View style={styles.nextPieceGrid}>
          {shape.map((row, y) => (
            <View key={y} style={styles.nextPieceRow}>
              {row.map((cell, x) => (
                <View
                  key={x}
                  style={[
                    styles.nextPieceCell,
                    {
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: cell !== 0 ? nextPiece.color : 'transparent'
                    }
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const displayBoard = renderBoard();
  const cellSize = Math.min(screenWidth * 0.8 / BOARD_WIDTH, (screenHeight * 0.5) / BOARD_HEIGHT);

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
        </View>
        <View style={styles.levelContainer}>
          <Text style={styles.levelLabel}>Level</Text>
          <Text style={styles.levelValue}>{level}</Text>
        </View>
        <View style={styles.linesContainer}>
          <Text style={styles.linesLabel}>Lines</Text>
          <Text style={styles.linesValue}>{linesCleared}</Text>
        </View>
      </View>

      {/* Next piece preview */}
      {renderNextPiece()}

      {/* Game Board */}
      <View style={styles.gameContainer}>
        <View style={[styles.board, { width: BOARD_WIDTH * cellSize, height: BOARD_HEIGHT * cellSize }]}>
          {displayBoard.map((row, y) => (
            <View key={y} style={styles.row}>
              {row.map((cell, x) => (
                <View
                  key={x}
                  style={[
                    styles.cell,
                    {
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: cell === EMPTY_CELL ? '#0f0f23' : 
                                     cell === 'ghost' ? 'rgba(255,255,255,0.2)' : cell,
                      borderColor: cell === EMPTY_CELL ? '#16213e' : '#333'
                    }
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Game Over Overlay */}
      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverTitle}>Game Over!</Text>
            <Text style={styles.gameOverScore}>Final Score: {score.toLocaleString()}</Text>
            <Text style={styles.gameOverLevel}>Level Reached: {level}</Text>
            <TouchableOpacity style={styles.restartButton} onPress={startNewGame}>
              <Text style={styles.restartButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Pause Overlay */}
      {isPaused && !gameOver && (
        <View style={styles.pauseOverlay}>
          <Text style={styles.pauseText}>PAUSED</Text>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {!gameStarted && !gameOver ? (
          <TouchableOpacity style={styles.startButton} onPress={startNewGame}>
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.topControls}>
              <TouchableOpacity style={styles.controlButton} onPress={togglePause}>
                <Text style={styles.controlButtonText}>{isPaused ? 'Resume' : 'Pause'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={handleHardDrop}>
                <Text style={styles.controlButtonText}>Drop</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bottomControls}>
              <TouchableOpacity style={styles.controlButton} onPress={() => handleMove('left')}>
                <Text style={styles.controlButtonText}>←</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={handleRotate}>
                <Text style={styles.controlButtonText}>↻</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={() => handleMove('right')}>
                <Text style={styles.controlButtonText}>→</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#16213e',
    marginBottom: 10,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreValue: {
    color: '#00f0f0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelContainer: {
    alignItems: 'center',
  },
  levelLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  levelValue: {
    color: '#f0a000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linesContainer: {
    alignItems: 'center',
  },
  linesLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  linesValue: {
    color: '#00f000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextPieceContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  nextPieceLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  nextPieceGrid: {
    backgroundColor: '#0f0f23',
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#16213e',
  },
  nextPieceRow: {
    flexDirection: 'row',
  },
  nextPieceCell: {
    borderWidth: 0.5,
    borderColor: '#333',
  },
  gameContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  board: {
    backgroundColor: '#0f0f23',
    borderWidth: 2,
    borderColor: '#16213e',
    borderRadius: 5,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  gameOverContainer: {
    backgroundColor: '#16213e',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f00000',
  },
  gameOverTitle: {
    color: '#f00000',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  gameOverScore: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 5,
  },
  gameOverLevel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  restartButton: {
    backgroundColor: '#00f0f0',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  restartButtonText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  pauseText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  controls: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  startButton: {
    backgroundColor: '#00f000',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#1a1a2e',
    fontSize: 20,
    fontWeight: 'bold',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    backgroundColor: '#16213e',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 80,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
