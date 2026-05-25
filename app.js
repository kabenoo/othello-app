const boardElement = document.getElementById("board");
const turnText = document.getElementById("turnText");
const scoreText = document.getElementById("scoreText");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const playerColorSelect = document.getElementById("playerColor");
const cpuLevelSelect = document.getElementById("cpuLevel");

const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

let board = [];
let currentTurn = BLACK;
let playerColor = BLACK;
let cpuColor = WHITE;
let cpuLevel = "easy";
let gameStarted = false;
let gameOver = false;

const directions = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

function initializeBoard() {
  board = [];

  for (let row = 0; row < 8; row++) {
    board[row] = [];
    for (let col = 0; col < 8; col++) {
      board[row][col] = EMPTY;
    }
  }

  // 初期配置
  board[3][3] = WHITE;
  board[3][4] = BLACK;
  board[4][3] = BLACK;
  board[4][4] = WHITE;

  currentTurn = BLACK;
  gameOver = false;
}

function renderBoard() {
  boardElement.innerHTML = "";

  const validMoves = getValidMoves(currentTurn);

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;

      if (
        gameStarted &&
        !gameOver &&
        currentTurn === playerColor &&
        validMoves.some(move => move.row === row && move.col === col)
      ) {
        cell.classList.add("valid-move");
      }

      if (board[row][col] === BLACK) {
        const stone = document.createElement("div");
        stone.className = "stone black";
        cell.appendChild(stone);
      }

      if (board[row][col] === WHITE) {
        const stone = document.createElement("div");
        stone.className = "stone white";
        cell.appendChild(stone);
      }

      cell.addEventListener("click", () => {
        handleCellClick(row, col);
      });

      boardElement.appendChild(cell);
    }
  }

  updateStatus();
}

function updateStatus() {
  const blackCount = countStones(BLACK);
  const whiteCount = countStones(WHITE);

  scoreText.textContent = `黒：${blackCount}　白：${whiteCount}`;

  if (!gameStarted) {
    turnText.textContent = "ゲーム開始を押してください";
    return;
  }

  if (gameOver) {
    if (blackCount > whiteCount) {
      turnText.textContent = `終局：黒の勝ちです！ 黒${blackCount} - 白${whiteCount}`;
    } else if (whiteCount > blackCount) {
      turnText.textContent = `終局：白の勝ちです！ 白${whiteCount} - 黒${blackCount}`;
    } else {
      turnText.textContent = `終局：引き分けです。黒${blackCount} - 白${whiteCount}`;
    }
    return;
  }

  const turnName = currentTurn === BLACK ? "黒" : "白";
  const playerName = currentTurn === playerColor ? "あなた" : "コンピュータ";

  turnText.textContent = `${turnName}の番です（${playerName}）`;
}

function countStones(color) {
  return countStonesOnBoard(board, color);
}

function getOpponent(color) {
  return color === BLACK ? WHITE : BLACK;
}

function isInsideBoard(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function getFlippableStones(row, col, color) {
  return getFlippableStonesOnBoard(board, row, col, color);
}

function isValidMove(row, col, color) {
  return getFlippableStones(row, col, color).length > 0;
}

function getValidMoves(color) {
  return getValidMovesOnBoard(board, color);
}

function placeStone(row, col, color) {
  const result = placeStoneOnBoard(board, row, col, color);
  return result.success;
}

function handleCellClick(row, col) {
  if (!gameStarted || gameOver) {
    return;
  }

  if (currentTurn !== playerColor) {
    return;
  }

  const success = placeStone(row, col, playerColor);

  if (!success) {
    turnText.textContent = "そこには置けません";
    return;
  }

  afterMove();
}

function afterMove() {
  changeTurn();

  if (checkGameEnd()) {
    renderBoard();
    return;
  }

  const validMoves = getValidMoves(currentTurn);

  if (validMoves.length === 0) {
    const passColorName = currentTurn === BLACK ? "黒" : "白";
    changeTurn();

    if (checkGameEnd()) {
      renderBoard();
      return;
    }

    renderBoard();
    turnText.textContent = `${passColorName}は置ける場所がないためパスしました`;

    if (currentTurn === cpuColor) {
      setTimeout(cpuMove, 800);
    }

    return;
  }

  renderBoard();

  if (currentTurn === cpuColor) {
    setTimeout(cpuMove, 600);
  }
}

function changeTurn() {
  currentTurn = currentTurn === BLACK ? WHITE : BLACK;
}

function checkGameEnd() {
  const blackMoves = getValidMoves(BLACK);
  const whiteMoves = getValidMoves(WHITE);

  if (blackMoves.length === 0 && whiteMoves.length === 0) {
    gameOver = true;
    return true;
  }

  return false;
}

function startGame() {
  const selectedColor = playerColorSelect.value;
  cpuLevel = cpuLevelSelect.value;

  if (selectedColor === "black") {
    playerColor = BLACK;
    cpuColor = WHITE;
  } else {
    playerColor = WHITE;
    cpuColor = BLACK;
  }

  initializeBoard();
  gameStarted = true;
  renderBoard();

  if (currentTurn === cpuColor) {
    setTimeout(cpuMove, 600);
  }
}

function cpuMove() {
  if (!gameStarted || gameOver) {
    return;
  }

  if (currentTurn !== cpuColor) {
    return;
  }

  const validMoves = getValidMoves(cpuColor);

  if (validMoves.length === 0) {
    changeTurn();
    renderBoard();
    return;
  }

  let move;

  if (cpuLevel === "easy") {
    // 弱い：今のまま
// 角を取る、辺を少し好む、危険マスを避ける
function chooseEasyMove(validMoves) {
  const cornerMoves = validMoves.filter(move => isCorner(move.row, move.col));

  if (cornerMoves.length > 0) {
    return chooseMostFlipsMove(cornerMoves);
  }

  const goodEdgeMoves = validMoves.filter(move => {
    return (
      move.row === 0 ||
      move.row === 7 ||
      move.col === 0 ||
      move.col === 7
    );
  });

  if (goodEdgeMoves.length > 0) {
    return chooseMostFlipsMove(goodEdgeMoves);
  }

  const dangerousMoves = validMoves.filter(move => {
    return isDangerNearEmptyCorner(move.row, move.col, board);
  });

  const saferMoves = validMoves.filter(move => {
    return !dangerousMoves.some(danger => {
      return danger.row === move.row && danger.col === move.col;
    });
  });

  if (saferMoves.length > 0) {
    return chooseMostFlipsMove(saferMoves);
  }

  return chooseMostFlipsMove(validMoves);
}

// 普通：これまでの「強い」2手先読み版
function chooseNormalMove(validMoves) {
  let bestMove = validMoves[0];
  let bestScore = -999999;

  for (const move of validMoves) {
    const score = evaluateMoveWithLookahead(move, cpuColor);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

// 強い：新しい深読み版
// ミニマックス法＋αβ枝刈りで、複数手先まで読む
function chooseHardMove(validMoves) {
  let bestMove = validMoves[0];
  let bestScore = -999999999;

  const emptyCount = countEmptyCellsOnBoard(board);
  const searchDepth = getSearchDepth(emptyCount);
  const orderedMoves = orderMovesForSearch(validMoves, board, cpuColor);

  for (const move of orderedMoves) {
    const nextBoard = copyBoard(board);
    const result = placeStoneOnBoard(nextBoard, move.row, move.col, cpuColor);

    if (!result.success) {
      continue;
    }

    const score = alphaBeta(
      nextBoard,
      getOpponent(cpuColor),
      searchDepth - 1,
      -999999999,
      999999999,
      cpuColor
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function getSearchDepth(emptyCount) {
  // スマホでも重くなりすぎない範囲で、終盤ほど深く読む
  if (emptyCount > 44) {
    return 3;
  }

  if (emptyCount > 24) {
    return 4;
  }

  if (emptyCount > 12) {
    return 5;
  }

  if (emptyCount > 8) {
    return 6;
  }

  // 残り8マス以下は、ほぼ最後まで読む
  return emptyCount;
}

function alphaBeta(targetBoard, turnColor, depth, alpha, beta, maximizingColor) {
  const opponent = getOpponent(turnColor);
  const moves = getValidMovesOnBoard(targetBoard, turnColor);

  const currentCanMove = moves.length > 0;
  const opponentCanMove = getValidMovesOnBoard(targetBoard, opponent).length > 0;

  // 終局
  if (!currentCanMove && !opponentCanMove) {
    return evaluateFinalBoard(targetBoard, maximizingColor);
  }

  // 読みの深さに到達
  if (depth <= 0) {
    return evaluateBoardForColor(targetBoard, maximizingColor);
  }

  // パス
  if (!currentCanMove) {
    return alphaBeta(
      targetBoard,
      opponent,
      depth - 1,
      alpha,
      beta,
      maximizingColor
    );
  }

  const orderedMoves = orderMovesForSearch(moves, targetBoard, turnColor);

  if (turnColor === maximizingColor) {
    let value = -999999999;

    for (const move of orderedMoves) {
      const nextBoard = copyBoard(targetBoard);
      const result = placeStoneOnBoard(nextBoard, move.row, move.col, turnColor);

      if (!result.success) {
        continue;
      }

      value = Math.max(
        value,
        alphaBeta(nextBoard, opponent, depth - 1, alpha, beta, maximizingColor)
      );

      alpha = Math.max(alpha, value);

      if (alpha >= beta) {
        break;
      }
    }

    return value;
  } else {
    let value = 999999999;

    for (const move of orderedMoves) {
      const nextBoard = copyBoard(targetBoard);
      const result = placeStoneOnBoard(nextBoard, move.row, move.col, turnColor);

      if (!result.success) {
        continue;
      }

      value = Math.min(
        value,
        alphaBeta(nextBoard, opponent, depth - 1, alpha, beta, maximizingColor)
      );

      beta = Math.min(beta, value);

      if (alpha >= beta) {
        break;
      }
    }

    return value;
  }
}

function orderMovesForSearch(moves, targetBoard, color) {
  return moves.slice().sort((a, b) => {
    const scoreA = getMoveOrderingScore(a, targetBoard, color);
    const scoreB = getMoveOrderingScore(b, targetBoard, color);
    return scoreB - scoreA;
  });
}

function getMoveOrderingScore(move, targetBoard, color) {
  const opponent = getOpponent(color);
  const testBoard = copyBoard(targetBoard);
  const result = placeStoneOnBoard(testBoard, move.row, move.col, color);

  if (!result.success) {
    return -999999;
  }

  let score = 0;

  if (isCorner(move.row, move.col)) {
    score += 100000;
  }

  if (isDangerNearEmptyCorner(move.row, move.col, targetBoard)) {
    score -= 50000;
  }

  score += getPositionScore(move.row, move.col, targetBoard) * 100;

  const opponentMoves = getValidMovesOnBoard(testBoard, opponent);
  if (opponentMoves.some(m => isCorner(m.row, m.col))) {
    score -= 80000;
  }

  score -= opponentMoves.length * 200;
  score += result.flippedCount * 10;

  return score;
}

function evaluateFinalBoard(targetBoard, color) {
  const opponent = getOpponent(color);
  const myCount = countStonesOnBoard(targetBoard, color);
  const opponentCount = countStonesOnBoard(targetBoard, opponent);
  const diff = myCount - opponentCount;

  if (diff > 0) {
    return 1000000 + diff * 1000;
  }

  if (diff < 0) {
    return -1000000 + diff * 1000;
  }

  return 0;
}

function chooseMostFlipsMove(validMoves) {
  let bestMove = validMoves[0];
  let bestScore = -1;

  for (const move of validMoves) {
    const flipCount = getFlippableStones(move.row, move.col, cpuColor).length;

    if (flipCount > bestScore) {
      bestScore = flipCount;
      bestMove = move;
    }
  }

  return bestMove;
}

function evaluateMoveWithLookahead(move, color) {
  const opponent = getOpponent(color);

  // 自分がその手を打った後の盤面
  const afterMyMoveBoard = copyBoard(board);
  const myResult = placeStoneOnBoard(afterMyMoveBoard, move.row, move.col, color);

  if (!myResult.success) {
    return -999999;
  }

  // 自分の手を打った直後の評価
  let myScore = evaluateBoardForColor(afterMyMoveBoard, color);

  // 相手の合法手
  const opponentMoves = getValidMovesOnBoard(afterMyMoveBoard, opponent);

  // 相手が打てないなら、自分にかなり有利
  if (opponentMoves.length === 0) {
    myScore += 1500;
    return myScore;
  }

  // 相手が最も良い手を打った場合を想定する
  let worstScoreForMe = 999999;

  for (const opponentMove of opponentMoves) {
    const afterOpponentMoveBoard = copyBoard(afterMyMoveBoard);
    const opponentResult = placeStoneOnBoard(
      afterOpponentMoveBoard,
      opponentMove.row,
      opponentMove.col,
      opponent
    );

    if (!opponentResult.success) {
      continue;
    }

    const scoreAfterOpponent = evaluateBoardForColor(afterOpponentMoveBoard, color);

    if (scoreAfterOpponent < worstScoreForMe) {
      worstScoreForMe = scoreAfterOpponent;
    }
  }

  // 相手の最善手を受けた後でも、一番マシな手を選ぶ
  return worstScoreForMe;
}

function evaluateBoardForColor(targetBoard, color) {
  const opponent = getOpponent(color);

  const emptyCount = countEmptyCellsOnBoard(targetBoard);
  const myCount = countStonesOnBoard(targetBoard, color);
  const opponentCount = countStonesOnBoard(targetBoard, opponent);

  const myMoves = getValidMovesOnBoard(targetBoard, color);
  const opponentMoves = getValidMovesOnBoard(targetBoard, opponent);

  let score = 0;

  // 1. 盤上の位置評価
  score += getTotalPositionScore(targetBoard, color) * 8;
  score -= getTotalPositionScore(targetBoard, opponent) * 8;

  // 2. 角の数
  score += countCornersOnBoard(targetBoard, color) * 12000;
  score -= countCornersOnBoard(targetBoard, opponent) * 12000;

  // 3. 角が空いている時の危険マス
  score -= countDangerNearEmptyCorners(targetBoard, color) * 3500;
  score += countDangerNearEmptyCorners(targetBoard, opponent) * 3500;

  // 4. 合法手数
  score += myMoves.length * 120;
  score -= opponentMoves.length * 180;

  // 5. 相手に角を取られる可能性を強く嫌う
  if (opponentMoves.some(move => isCorner(move.row, move.col))) {
    score -= 9000;
  }

  // 6. 自分が角を取れるなら高評価
  if (myMoves.some(move => isCorner(move.row, move.col))) {
    score += 9000;
  }

  // 7. フロンティア石
  score -= countFrontierStones(targetBoard, color) * 45;
  score += countFrontierStones(targetBoard, opponent) * 45;

  // 8. 序盤は石数をあまり重視しない
  if (emptyCount > 40) {
    score -= (myCount - opponentCount) * 15;
  }

  // 9. 中盤は石数より、手数・形を重視
  if (emptyCount <= 40 && emptyCount > 15) {
    score += (myCount - opponentCount) * 8;
  }

  // 10. 終盤は石数を強く重視
  if (emptyCount <= 15) {
    score += (myCount - opponentCount) * 220;
  }

  // 11. 終局している場合
  if (myMoves.length === 0 && opponentMoves.length === 0) {
    return evaluateFinalBoard(targetBoard, color);
  }

  return score;
}

function copyBoard(sourceBoard) {
  return sourceBoard.map(row => row.slice());
}

function placeStoneOnBoard(targetBoard, row, col, color) {
  const flippableStones = getFlippableStonesOnBoard(targetBoard, row, col, color);

  if (flippableStones.length === 0) {
    return {
      success: false,
      flippedCount: 0
    };
  }

  targetBoard[row][col] = color;

  for (const stone of flippableStones) {
    targetBoard[stone.row][stone.col] = color;
  }

  return {
    success: true,
    flippedCount: flippableStones.length
  };
}

function getFlippableStonesOnBoard(targetBoard, row, col, color) {
  if (targetBoard[row][col] !== EMPTY) {
    return [];
  }

  const opponent = getOpponent(color);
  let flippableStones = [];

  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    let tempStones = [];

    while (isInsideBoard(r, c) && targetBoard[r][c] === opponent) {
      tempStones.push({ row: r, col: c });
      r += dr;
      c += dc;
    }

    if (
      tempStones.length > 0 &&
      isInsideBoard(r, c) &&
      targetBoard[r][c] === color
    ) {
      flippableStones = flippableStones.concat(tempStones);
    }
  }

  return flippableStones;
}

function getValidMovesOnBoard(targetBoard, color) {
  const validMoves = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const flippable = getFlippableStonesOnBoard(targetBoard, row, col, color);

      if (flippable.length > 0) {
        validMoves.push({ row, col });
      }
    }
  }

  return validMoves;
}

function countEmptyCellsOnBoard(targetBoard) {
  let count = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (targetBoard[row][col] === EMPTY) {
        count++;
      }
    }
  }

  return count;
}

function countStonesOnBoard(targetBoard, color) {
  let count = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (targetBoard[row][col] === color) {
        count++;
      }
    }
  }

  return count;
}

function isCorner(row, col) {
  return (
    (row === 0 && col === 0) ||
    (row === 0 && col === 7) ||
    (row === 7 && col === 0) ||
    (row === 7 && col === 7)
  );
}

function isDangerNearEmptyCorner(row, col, targetBoard) {
  const dangerMap = [
    {
      corner: [0, 0],
      danger: [[0, 1], [1, 0], [1, 1]]
    },
    {
      corner: [0, 7],
      danger: [[0, 6], [1, 6], [1, 7]]
    },
    {
      corner: [7, 0],
      danger: [[6, 0], [6, 1], [7, 1]]
    },
    {
      corner: [7, 7],
      danger: [[6, 6], [6, 7], [7, 6]]
    }
  ];

  for (const item of dangerMap) {
    const [cornerRow, cornerCol] = item.corner;

    if (targetBoard[cornerRow][cornerCol] !== EMPTY) {
      continue;
    }

    const isDanger = item.danger.some(pos => {
      return pos[0] === row && pos[1] === col;
    });

    if (isDanger) {
      return true;
    }
  }

  return false;
}

function countCornersOnBoard(targetBoard, color) {
  let count = 0;

  if (targetBoard[0][0] === color) count++;
  if (targetBoard[0][7] === color) count++;
  if (targetBoard[7][0] === color) count++;
  if (targetBoard[7][7] === color) count++;

  return count;
}

function countDangerNearEmptyCorners(targetBoard, color) {
  let count = 0;

  const dangerMap = [
    {
      corner: [0, 0],
      danger: [[0, 1], [1, 0], [1, 1]]
    },
    {
      corner: [0, 7],
      danger: [[0, 6], [1, 6], [1, 7]]
    },
    {
      corner: [7, 0],
      danger: [[6, 0], [6, 1], [7, 1]]
    },
    {
      corner: [7, 7],
      danger: [[6, 6], [6, 7], [7, 6]]
    }
  ];

  for (const item of dangerMap) {
    const [cornerRow, cornerCol] = item.corner;

    if (targetBoard[cornerRow][cornerCol] !== EMPTY) {
      continue;
    }

    for (const [row, col] of item.danger) {
      if (targetBoard[row][col] === color) {
        count++;
      }
    }
  }

  return count;
}

function getTotalPositionScore(targetBoard, color) {
  let total = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (targetBoard[row][col] === color) {
        total += getPositionScore(row, col, targetBoard);
      }
    }
  }

  return total;
}

function getPositionScore(row, col, targetBoard) {
  const positionScoreTable = [
    [120, -40,  20,   5,   5,  20, -40, 120],
    [-40, -80,  -5,  -5,  -5,  -5, -80, -40],
    [ 20,  -5,  15,   3,   3,  15,  -5,  20],
    [  5,  -5,   3,   3,   3,   3,  -5,   5],
    [  5,  -5,   3,   3,   3,   3,  -5,   5],
    [ 20,  -5,  15,   3,   3,  15,  -5,  20],
    [-40, -80,  -5,  -5,  -5,  -5, -80, -40],
    [120, -40,  20,   5,   5,  20, -40, 120]
  ];

  let score = positionScoreTable[row][col];

  // すでに角を取っている場合、その角周辺は危険ではなくなる
  if (targetBoard[0][0] !== EMPTY) {
    if ((row === 0 && col === 1) || (row === 1 && col === 0) || (row === 1 && col === 1)) {
      score += 80;
    }
  }

  if (targetBoard[0][7] !== EMPTY) {
    if ((row === 0 && col === 6) || (row === 1 && col === 6) || (row === 1 && col === 7)) {
      score += 80;
    }
  }

  if (targetBoard[7][0] !== EMPTY) {
    if ((row === 6 && col === 0) || (row === 6 && col === 1) || (row === 7 && col === 1)) {
      score += 80;
    }
  }

  if (targetBoard[7][7] !== EMPTY) {
    if ((row === 6 && col === 6) || (row === 6 && col === 7) || (row === 7 && col === 6)) {
      score += 80;
    }
  }

  return score;
}

function countFrontierStones(targetBoard, color) {
  let count = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (targetBoard[row][col] !== color) {
        continue;
      }

      if (isFrontierStone(targetBoard, row, col)) {
        count++;
      }
    }
  }

  return count;
}

function isFrontierStone(targetBoard, row, col) {
  for (const [dr, dc] of directions) {
    const r = row + dr;
    const c = col + dc;

    if (isInsideBoard(r, c) && targetBoard[r][c] === EMPTY) {
      return true;
    }
  }

  return false;
}

startBtn.addEventListener("click", startGame);

resetBtn.addEventListener("click", () => {
  initializeBoard();
  gameStarted = false;
  gameOver = false;
  renderBoard();
});

initializeBoard();
renderBoard();
