let questions = [];
let currentIndex = 0;
let score = 0;
let timer;
let playerName = "";
let playersData = JSON.parse(localStorage.getItem("playersData")) || [];

fetch('questions.json')
    .then(response => response.json())
    .then(data => questions = data);

function startGame() {
    playerName = document.getElementById("playerName").value.trim();
    if(!playerName) { alert("নাম লিখুন"); return; }
    document.getElementById("player-name-screen").classList.add("hidden");
    document.getElementById("quiz-screen").classList.remove("hidden");
    showQuestion();
}

function showQuestion() {
    if(currentIndex >= questions.length) { showResult(); return; }
    let q = questions[currentIndex];
    document.getElementById("question").textContent = q.question;
    let optionsHtml = "";
    q.options.forEach((opt,i) => {
        optionsHtml += `<div class="option-btn" onclick="selectOption(${i})">${opt}</div>`;
    });
    document.getElementById("options").innerHTML = optionsHtml;
    startTimer();
}

function startTimer() {
    let time = 15;
    document.getElementById("timer").textContent = time;
    timer = setInterval(() => {
        time--;
        document.getElementById("timer").textContent = time;
        if(time <= 0) {
            clearInterval(timer);
            selectOption(-1);
        }
    },1000);
}

function selectOption(selectedIndex) {
    clearInterval(timer);
    let q = questions[currentIndex];
    let buttons = document.querySelectorAll(".option-btn");
    buttons.forEach((btn,i) => {
        if(i === q.correctIndex) { btn.classList.add("correct"); }
        if(i === selectedIndex && i !== q.correctIndex) { btn.classList.add("wrong"); }
    });
    if(selectedIndex === q.correctIndex) { score += 1; }
    currentIndex++;
    setTimeout(showQuestion,1000);
}

function showResult() {
    document.getElementById("quiz-screen").classList.add("hidden");
    document.getElementById("result-screen").classList.remove("hidden");
    document.getElementById("score").textContent = `${playerName}, আপনার স্কোর: ${score}/${questions.length}`;

    // Save player data
    playersData.push({name: playerName, score: score});
    localStorage.setItem("playersData", JSON.stringify(playersData));

    // Show all players
    let listHtml = "<h3>Players:</h3>";
    playersData.forEach(p => {
        listHtml += `<div>${p.name} - ${p.score}</div>`;
    });
    document.getElementById("players-list").innerHTML = listHtml;
}

function restartGame() {
    currentIndex = 0;
    score = 0;
    document.getElementById("result-screen").classList.add("hidden");
    document.getElementById("player-name-screen").classList.remove("hidden");
    document.getElementById("playerName").value = "";
}
