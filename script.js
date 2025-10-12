let questions = [];
let currentQuestion = 0;
let correctCount = 0;
let wrongCount = 0;
let coins = 0;
let timerInterval;
let timeLeft = 30;
let playerName = "";
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("next-btn").addEventListener("click", nextQuestion);

async function startGame() {
  playerName = document.getElementById("player-name").value.trim();
  if (!playerName) return alert("অনুগ্রহ করে আপনার নাম লিখুন!");
  document.getElementById("name-screen").classList.add("hidden");
  document.getElementById("quiz-screen").classList.remove("hidden");
  document.getElementById("display-name").innerText = playerName;

  const res = await fetch("questions.json");
  questions = await res.json();
  shuffleArray(questions);
  showQuestion();
  startTimer();
}

function showQuestion() {
  resetState();
  const q = questions[currentQuestion];
  document.getElementById("question-text").innerText = q.question;
  let shuffledOptions = [...q.options];
  shuffleArray(shuffledOptions);

  shuffledOptions.forEach(option => {
    const btn = document.createElement("button");
    btn.innerText = option;
    btn.classList.add("option");
    btn.addEventListener("click", () => selectAnswer(btn, q.answer));
    document.getElementById("options-container").appendChild(btn);
  });
}

function selectAnswer(btn, correctAns) {
  const allOptions = document.querySelectorAll(".option");
  allOptions.forEach(b => b.disabled = true);

  if (btn.innerText === correctAns) {
    btn.classList.add("correct");
    correctCount++;
    coins += 10;
  } else {
    btn.classList.add("wrong");
    wrongCount++;
    // highlight correct
    allOptions.forEach(o => {
      if (o.innerText === correctAns) o.classList.add("correct");
    });
  }

  document.getElementById("correct-count").innerText = correctCount;
  document.getElementById("wrong-count").innerText = wrongCount;
  document.getElementById("coins").innerText = coins;
  document.getElementById("next-btn").classList.remove("hidden");
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
    document.getElementById("next-btn").classList.add("hidden");
    resetTimer();
  } else {
    endGame();
  }
}

function resetState() {
  document.getElementById("options-container").innerHTML = "";
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function startTimer() {
  timeLeft = 30;
  document.getElementById("timer").innerText = timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").innerText = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      nextQuestion();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  startTimer();
}

function endGame() {
  clearInterval(timerInterval);
  alert(`${playerName}, গেম শেষ! ✅\nসঠিক: ${correctCount} | ভুল: ${wrongCount} | কয়েন: ${coins}`);

  leaderboard.push({ name: playerName, score: coins });
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  updateLeaderboard();
}

function updateLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  list.innerHTML = "";
  leaderboard.slice(0, 10).forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${p.name} — ${p.score}💰`;
    list.appendChild(li);
  });
}
