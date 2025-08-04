import React, { useState, useEffect } from "react";
import "./App.css";

/*
  Color Palette (from requirements):
    --primary: #1976d2 (main blue for buttons/accents)
    --secondary: #eeeeee (backgrounds, light neutral)
    --accent: #ff5252 (for winner or error highlights)
  Board, score, and controls use these.
*/

// Board size
const SIZE = 3;

// PUBLIC_INTERFACE
/**
 * Computes if there's a winner, a draw, or if the game is still in progress.
 * @param {string[]} squares - Array of 9 elements: "X", "O", or "".
 * @returns {object} {winner: "X"|"O"|null, line: [i,j,k]|null, isDraw: boolean}
 */
function calculateWinner(squares) {
  // All winning combinations for 3x3 Tic Tac Toe
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6],            // diagonals
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c], isDraw: false };
    }
  }
  // Draw if all filled and no winner
  if (squares.every(Boolean)) {
    return { winner: null, line: null, isDraw: true };
  }
  return { winner: null, line: null, isDraw: false };
}

// PUBLIC_INTERFACE
/**
 * Square (cell) component for the board.
 */
function Square({ value, onClick, highlight }) {
  return (
    <button
      className={`ttt-square${highlight ? " highlight" : ""}`}
      onClick={onClick}
      aria-label={value ? `Cell: ${value}` : "Empty cell"}
      disabled={!!value}
      tabIndex={0}
    >
      {value}
    </button>
  );
}

// PUBLIC_INTERFACE
/**
 * Top-level app with board, status, controls, and score tracking.
 */
function App() {
  // gameBoard: Array of "X", "O", or "" (9 elements)
  const [board, setBoard] = useState(Array(SIZE * SIZE).fill(""));
  // true: X's turn, false: O's turn
  const [xIsNext, setXIsNext] = useState(true);
  // Track scores as { X: int, O: int, D: int }
  const [score, setScore] = useState({ X: 0, O: 0, D: 0 });
  // Winner results
  const { winner, line, isDraw } = calculateWinner(board);

  // For focus/UX, optionally track last move
  const [lastMove, setLastMove] = useState(null);

  // When a move triggers a winner/draw, update score
  useEffect(() => {
    if (winner || isDraw) {
      setScore((prev) => {
        if (winner) {
          return { ...prev, [winner]: prev[winner] + 1 };
        }
        if (isDraw) {
          return { ...prev, D: prev.D + 1 };
        }
        return prev;
      });
    }
    // Only run for winning or draw states
    // eslint-disable-next-line
  }, [winner, isDraw]);

  // PUBLIC_INTERFACE
  /**
   * Handles click on board square.
   * @param {number} i
   */
  function handleSquareClick(i) {
    if (board[i] || winner || isDraw) return;
    const newBoard = board.slice();
    newBoard[i] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext((prev) => !prev);
    setLastMove(i);
  }

  // PUBLIC_INTERFACE
  /**
   * Restarts the current round; retains score but clears board & turn.
   */
  function handleRestart() {
    setBoard(Array(SIZE * SIZE).fill(""));
    setXIsNext(true);
    setLastMove(null);
  }

  // PUBLIC_INTERFACE
  /**
   * Starts a fresh game (clears board, scores, and resets to X).
   */
  function handleNewGame() {
    setBoard(Array(SIZE * SIZE).fill(""));
    setXIsNext(true);
    setScore({ X: 0, O: 0, D: 0 });
    setLastMove(null);
  }

  // Modern light-responsive palette
  // We'll use inline style as well for visual cues
  const theme = {
    "--ttt-primary": "#1976d2",
    "--ttt-secondary": "#eeeeee",
    "--ttt-accent": "#ff5252",
    "--ttt-highlight": "#ffe0b2",
    "--ttt-x": "#1976d2",
    "--ttt-o": "#ff5252",
    "--ttt-bg": "#fff",
    "--ttt-board": "#f4f8fb",
    "--ttt-border": "#e0e0e0",
    "--ttt-shadow": "rgba(25,118,210,0.09)",
  };

  // Render 3x3 board in rows
  function renderBoard() {
    let table = [];
    for (let row = 0; row < SIZE; row++) {
      let cells = [];
      for (let col = 0; col < SIZE; col++) {
        const idx = row * SIZE + col;
        const isHighlight = line?.includes(idx);
        cells.push(
          <Square
            key={idx}
            value={board[idx]}
            onClick={() => handleSquareClick(idx)}
            highlight={isHighlight}
          />
        );
      }
      table.push(
        <div className="ttt-row" key={row}>
          {cells}
        </div>
      );
    }
    return table;
  }

  let statusMsg;
  if (winner) {
    statusMsg = (
      <span className="ttt-status-winner">
        Winner: <span className={`ttt-status-${winner}`}>{winner}</span> 🎉
      </span>
    );
  } else if (isDraw) {
    statusMsg = <span className="ttt-status-draw">Draw! 🤝</span>;
  } else {
    statusMsg = (
      <span>
        Turn:{" "}
        <span
          className={`ttt-status-${xIsNext ? "X" : "O"}`}
          aria-live="polite"
        >
          {xIsNext ? "X" : "O"}
        </span>
      </span>
    );
  }

  return (
    <div className="ttt-app" style={theme}>
      <main className="ttt-main">
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <ScoreTracker score={score} />
        <section className="ttt-game-area">
          <div className="ttt-board">{renderBoard()}</div>
          <div className="ttt-status">{statusMsg}</div>
        </section>
        <div className="ttt-controls">
          <button className="ttt-btn ttt-btn-primary" onClick={handleRestart}>
            Restart Round
          </button>
          <button className="ttt-btn ttt-btn-outline" onClick={handleNewGame}>
            New Game
          </button>
        </div>
        <footer className="ttt-footer">
          <span>Player 1: <span style={{ color: "#1976d2" }}>X</span> | Player 2: <span style={{ color: "#ff5252" }}>O</span></span>
        </footer>
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * Score Tracker, displays wins for X, O, and draws (D).
 */
function ScoreTracker({ score }) {
  return (
    <div className="ttt-score">
      <div className="ttt-score-x" title="Player X">
        X: <span>{score.X}</span>
      </div>
      <div className="ttt-score-o" title="Player O">
        O: <span>{score.O}</span>
      </div>
      <div className="ttt-score-d" title="Draws">
        Draw: <span>{score.D}</span>
      </div>
    </div>
  );
}

export default App;
