(() => {
  const SIZE = 5;
  const boardElement = document.querySelector("#lights-board");
  const moveCount = document.querySelector("#move-count");
  const bestMoves = document.querySelector("#best-moves");
  const undoButton = document.querySelector("#undo-button");
  const resetButton = document.querySelector("#reset-button");
  const newPuzzleButton = document.querySelector("#new-puzzle-button");
  const status = document.querySelector("#puzzle-status");
  const winModal = document.querySelector("#win-modal");
  const history = [];
  let board = [];
  let startingBoard = [];
  let moves = 0;
  let puzzle = 0;
  let finished = false;

  const emptyBoard = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const copyBoard = (source) => source.map((row) => [...row]);
  const countLights = (source) => source.flat().filter(Boolean).length;

  function flip(source, row, col) {
    [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) source[r][c] = !source[r][c];
    });
  }

  function makePuzzle() {
    let result;
    do {
      result = emptyBoard();
      const cells = Array.from({ length: SIZE * SIZE }, (_, i) => i).sort(() => Math.random() - 0.5);
      const scramble = 13 + Math.floor(Math.random() * 5);
      cells.slice(0, scramble).forEach((cell) => flip(result, Math.floor(cell / SIZE), cell % SIZE));
    } while (countLights(result) < 7 || countLights(result) > 20);
    return result;
  }

  function render() {
    boardElement.replaceChildren();
    board.forEach((row, r) => row.forEach((on, c) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `light-cell${on ? " on" : ""}`;
      button.setAttribute("aria-label", `${r + 1}行${c + 1}列、${on ? "点灯" : "消灯"}`);
      button.setAttribute("aria-pressed", String(on));
      button.addEventListener("click", () => makeMove(r, c));
      boardElement.append(button);
    }));
    moveCount.textContent = String(moves);
    bestMoves.textContent = localStorage.getItem("lightsOutBest") || "—";
    undoButton.disabled = history.length === 0 || finished;
    resetButton.disabled = moves === 0 || finished;
  }

  function makeMove(row, col) {
    if (finished) return;
    history.push({ board: copyBoard(board), moves });
    flip(board, row, col);
    moves += 1;
    if (countLights(board) === 0) {
      finished = true;
      const best = Number(localStorage.getItem("lightsOutBest"));
      if (!best || moves < best) localStorage.setItem("lightsOutBest", String(moves));
      document.querySelector("#win-message").textContent = `${moves}手でクリア！次はもっと少ない手数を目指そう。`;
      winModal.classList.remove("hidden");
      status.textContent = "盤面クリア！おめでとう！";
    }
    render();
    if (finished) document.querySelector("#next-puzzle-button").focus();
  }

  function undo() {
    const previous = history.pop();
    if (!previous || finished) return;
    board = previous.board;
    moves = previous.moves;
    status.textContent = "一手戻したよ";
    render();
  }

  function reset() {
    if (finished) return;
    board = copyBoard(startingBoard);
    moves = 0;
    history.length = 0;
    status.textContent = "最初の盤面に戻したよ";
    render();
  }

  function newPuzzle() {
    board = makePuzzle();
    startingBoard = copyBoard(board);
    history.length = 0;
    moves = 0;
    finished = false;
    puzzle += 1;
    document.querySelector("#puzzle-number").textContent = String(puzzle).padStart(2, "0");
    winModal.classList.add("hidden");
    status.textContent = "点灯中のライトをすべて消そう";
    render();
  }

  undoButton.addEventListener("click", undo);
  resetButton.addEventListener("click", reset);
  newPuzzleButton.addEventListener("click", newPuzzle);
  document.querySelector("#next-puzzle-button").addEventListener("click", newPuzzle);
  document.querySelector("#modal-close").addEventListener("click", () => winModal.classList.add("hidden"));
  winModal.addEventListener("click", (event) => { if (event.target === winModal) winModal.classList.add("hidden"); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") winModal.classList.add("hidden"); });
  startingBoard = makePuzzle();
  board = copyBoard(startingBoard);
  puzzle = 1;
  render();
})();
