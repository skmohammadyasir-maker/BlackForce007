let questions = [];
let currentQuestion = 0;
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let coins = 0;
let timer;
let timeLeft = 15;
let playerName = "";

fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
    });

function startGame() {
    playerName = document.getElementById('playerName').value.trim();
    if(playerName === "") {
        alert("দয়া করে আপনার নাম লিখুন!");
        return;
    }

    document.getElementById('player-name-input').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');
    loadQuestion();
}

function loadQuestion() {
    if(currentQuestion >= questions.length){
        endGame();
        return;
    }

    timeLeft = 15;
    document.getElementById('timer').textContent = timeLeft;
    startTimer();

    let q = questions[currentQuestion];
    document.getElementById('question-text').textContent = q.question;

    let optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = "";

    q.options.forEach((option, index) => {
        let btn = document.createElement('button');
        btn.textContent = option;
        btn.addEventListener('click', () => selectAnswer(index));
        optionsDiv.appendChild(btn);
    });
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        if(timeLeft <= 0) {
            clearInterval(timer);
            selectAnswer(-1); // timeout
        }
    }, 1000);
}

function selectAnswer(index) {
    clearInterval(timer);
    let q = questions[currentQuestion];
    let buttons = document.querySelectorAll('#options button');

    if(index === q.correctIndex){
        buttons[index].classList.add('correct');
        score += 10;
        coins += 1;
        correctCount++;
        document.getElementById('correctSound').play();
    } else {
        if(index !== -1) buttons[index].classList.add('wrong');
        buttons[q.correctIndex].classList.add('correct');
        wrongCount++;
        document.getElementById('wrongSound').play();
    }

    document.getElementById('score').textContent = score;
    document.getElementById('coins').textContent = coins;
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('wrongCount').textContent = wrongCount;

    setTimeout(() => {
        currentQuestion++;
        loadQuestion();
    }, 1500);
}

function endGame() {
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('result-container').classList.remove('hidden');

    document.getElementById('playerDisplay').textContent = playerName;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalCorrect').textContent = correctCount;
    document.getElementById('finalWrong').textContent = wrongCount;

    saveScore(playerName, score);
    showLeaderboard();
}

function restartGame() {
    currentQuestion = 0;
    score = 0;
    correctCount = 0;
    wrongCount = 0;
    coins = 0;
    document.getElementById('result-container').classList.add('hidden');
    document.getElementById('player-name-input').classList.remove('hidden');
}

function saveScore(name, score){
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({name: name, score: score});
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function showLeaderboard(){
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.sort((a,b) => b.score - a.score);
    let ul = document.getElementById('leaderboard');
    ul.innerHTML = "";
    leaderboard.forEach(player => {
        let li = document.createElement('li');
        li.textContent = `${player.name} - ${player.score} পয়েন্ট`;
        ul.appendChild(li);
    });
}
