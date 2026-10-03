(() => {
  const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const MAX_TRIES = 8;
  const slots = [...document.querySelectorAll(".code-slot")];
  const keys = [...document.querySelectorAll(".number-key")];
  const submitButton = document.querySelector("#submit-button");
  const clearButton = document.querySelector("#clear-button");
  const triesLeft = document.querySelector("#tries-left");
  const historyCount = document.querySelector("#history-count");
  const historyList = document.querySelector("#history-list");
  const inputHint = document.querySelector("#input-hint");
  const modal = document.querySelector("#modal");
  const toast = document.querySelector("#toast");
  let answer = [];
  let guess = [];
  let guesses = [];
  let round = 1;
  let toastTimer;

  function makeAnswer() {
    return [...DIGITS].sort(() => Math.random() - 0.5).slice(0, 4);
  }

  function renderInput() {
    slots.forEach((slot, index) => {
      slot.classList.toggle("active", index === guess.length && guess.length < 4);
      slot.querySelector("span").textContent = guess[index] ?? "_";
    });
    keys.forEach((key) => {
      key.disabled = guess.includes(Number(key.dataset.number)) || guess.length >= 4;
    });
    submitButton.disabled = guess.length !== 4;
    inputHint.textContent = guess.length === 4 ? "準備できたら推理するを押そう" : `あと${4 - guess.length}つ選んでね`;
  }

  function addDigit(digit) {
    if (guess.length >= 4 || guess.includes(digit)) return;
    guess.push(digit);
    renderInput();
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1900);
  }

  function evaluate(candidate) {
    const exact = candidate.reduce((count, digit, index) => count + Number(digit === answer[index]), 0);
    const present = candidate.filter((digit) => answer.includes(digit)).length;
    return { exact, exists: present - exact };
  }

  function countMarkup(label, count, className) {
    return `<span class="feedback-count ${className}" aria-label="${label} ${count}">${count ? "<i></i>".repeat(count) : ""}<b>${count}</b></span>`;
  }

  function renderHistory() {
    triesLeft.textContent = MAX_TRIES - guesses.length;
    historyCount.textContent = `${guesses.length} / ${MAX_TRIES}`;
    if (!guesses.length) {
      historyList.innerHTML = '<div class="empty-state"><span class="empty-icon">⌁</span><span>最初の推理を入力しよう</span></div>';
      return;
    }
    historyList.innerHTML = guesses.map((entry, index) => `
      <div class="guess-row">
        <span class="guess-index">${String(index + 1).padStart(2, "0")}</span>
        <span class="guess-digits">${entry.digits.map((digit) => `<span class="guess-digit">${digit}</span>`).join("")}</span>
        <span class="feedback">${countMarkup("位置も数字も正解", entry.result.exact, "exact")}${countMarkup("数字だけ正解", entry.result.exists, "exists")}</span>
      </div>`).join("");
    historyList.scrollTop = historyList.scrollHeight;
  }

  function openResult(won) {
    const scoreKey = "puzzleLabBest";
    const best = Number(localStorage.getItem(scoreKey));
    if (won && (!best || guesses.length < best)) localStorage.setItem(scoreKey, String(guesses.length));
    document.querySelector("#best-score").textContent = localStorage.getItem(scoreKey) || "—";
    document.querySelector("#modal-symbol").textContent = won ? "✦" : "⌁";
    document.querySelector("#modal-kicker").textContent = won ? "NICE WORK" : "TRY AGAIN";
    document.querySelector("#modal-title").textContent = won ? "コード解読成功！" : "あと一歩！";
    document.querySelector("#modal-message").textContent = won
      ? `${guesses.length}回で正解。鋭い推理だったね。`
      : "挑戦回数を使い切ったよ。次のコードでリベンジしよう。";
    document.querySelector("#solution-code").innerHTML = answer.map((digit) => `<span>${digit}</span>`).join("");
    modal.classList.remove("hidden");
    document.querySelector("#new-game-button").focus();
  }

  function submitGuess() {
    if (guess.length !== 4) return;
    const digits = [...guess];
    const result = evaluate(digits);
    guesses.push({ digits, result });
    guess = [];
    renderInput();
    renderHistory();
    if (result.exact === 4) openResult(true);
    else if (guesses.length === MAX_TRIES) openResult(false);
  }

  function newGame() {
    answer = makeAnswer();
    guess = [];
    guesses = [];
    round += 1;
    document.querySelector("#round-number").textContent = String(round).padStart(2, "0");
    document.querySelector("#best-score").textContent = localStorage.getItem("puzzleLabBest") || "—";
    modal.classList.add("hidden");
    renderInput();
    renderHistory();
  }

  keys.forEach((key) => key.addEventListener("click", () => addDigit(Number(key.dataset.number))));
  submitButton.addEventListener("click", submitGuess);
  clearButton.addEventListener("click", () => { guess.pop(); renderInput(); });
  document.querySelector("#new-game-button").addEventListener("click", newGame);
  document.querySelector("#modal-close").addEventListener("click", () => modal.classList.add("hidden"));
  document.querySelector("#help-button").addEventListener("click", () => showToast("1〜9から4つ選び、手がかりでコードを解こう！"));
  modal.addEventListener("click", (event) => { if (event.target === modal) modal.classList.add("hidden"); });
  document.addEventListener("keydown", (event) => {
    if (/^[1-9]$/.test(event.key)) addDigit(Number(event.key));
    if (event.key === "Backspace") { guess.pop(); renderInput(); }
    if (event.key === "Enter" && guess.length === 4 && modal.classList.contains("hidden")) submitGuess();
    if (event.key === "Escape") modal.classList.add("hidden");
  });

  document.querySelector("#best-score").textContent = localStorage.getItem("puzzleLabBest") || "—";
  answer = makeAnswer();
  renderInput();
})();
