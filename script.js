// Game script — advanced template
const TIMER = 15;
let questions = [];
let shuffled = [];
let currentIndex = 0;
let timer = null;
let timeLeft = TIMER;
let playerName = '';
let score = 0;
let coins = 0;
let correctCount = 0;
let wrongCount = 0;

// DOM
const nameModal = document.getElementById('nameModal');
const playerNameInput = document.getElementById('playerNameInput');
const modalStartBtn = document.getElementById('modalStartBtn');

const questionText = document.getElementById('questionText');
const choicesWrap = document.getElementById('choices');
const timerEl = document.getElementById('timer');
const qIndexEl = document.getElementById('qIndex');
const qTotalEl = document.getElementById('qTotal');
const currentPlayerEl = document.getElementById('currentPlayer');
const coinsEl = document.getElementById('coins');
const correctCountEl = document.getElementById('correctCount');
const wrongCountEl = document.getElementById('wrongCount');
const leaderboardEl = document.getElementById('leaderboard');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');

// audio beep
function beep(freq=440,dur=0.08,vol=0.05,type='sine'){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    setTimeout(()=>{ o.stop(); ctx.close(); }, dur*1000);
  }catch(e){}
}

// load questions
async function loadQuestions(){
  try{
    const res = await fetch('questions.json');
    questions = await res.json();
  }catch(e){
    console.error('questions.json load failed', e);
    questions = [];
  }
}

// shuffle helper
function shuffle(a){
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

// show name modal on open
window.addEventListener('load', async ()=>{
  await loadQuestions();
  nameModal.style.display = 'flex';
  qTotalEl.textContent = questions.length || 0;
});

// modal start
modalStartBtn.addEventListener('click', ()=>{
  const v = playerNameInput.value.trim();
  if(!v){ alert('নাম লিখুন'); return; }
  playerName = v;
  nameModal.style.display = 'none';
  startNewGame();
});

// start new game
function startNewGame(){
  shuffled = shuffle(questions.slice());
  currentIndex = 0;
  score = 0; coins = 0; correctCount = 0; wrongCount = 0;
  updatePlayerUI();
  updateStatsUI();
  renderQuestion();
  persistTinyPlayer(); // show current player instantly
}

// render question
function renderQuestion(){
  if(currentIndex >= shuffled.length){
    endGame();
    return;
  }
  const q = shuffled[currentIndex];
  questionText.textContent = q.question;
  choicesWrap.innerHTML = '';
  q.options.forEach((opt, i) => {
    const el = document.createElement('div');
    el.className = 'choice';
    el.textContent = opt;
    el.dataset.idx = i;
    el.addEventListener('click', ()=> selectOption(i, el));
    choicesWrap.appendChild(el);
  });
  qIndexEl.textContent = currentIndex+1;
  qTotalEl.textContent = shuffled.length;
  startTimer();
  // reset message
  messageEl.textContent = '';
}

// timer
function startTimer(){
  clearInterval(timer);
  timeLeft = TIMER;
  timerEl.textContent = timeLeft;
  timer = setInterval(()=>{
    timeLeft--;
    timerEl.textContent = timeLeft;
    if(timeLeft <= 3) timerEl.style.color = '#f97316'; else timerEl.style.color = '';
    if(timeLeft <= 0){ clearInterval(timer); handleTimeout(); }
  },1000);
}
function stopTimer(){ clearInterval(timer); timer=null; }

// when time out
function handleTimeout(){
  revealAnswer(null, true);
  beep(200,0.12,0.06,'sawtooth');
}

// select option
function selectOption(selectedIdx, el){
  if(timer===null) return; // already answered
  stopTimer();
  revealAnswer(selectedIdx, false);
}

// reveal answer
function revealAnswer(selectedIdx, timedOut){
  const q = shuffled[currentIndex];
  const correct = Number(q.correctIndex);
  const choiceEls = Array.from(choicesWrap.children);
  choiceEls.forEach((el, i) => {
    el.classList.add('dim');
    if(i === correct){
      el.classList.remove('dim'); el.classList.add('correct','big');
      // spin effect after slight delay
      setTimeout(()=> el.classList.add('spin'), 50);
    }
    if(selectedIdx !== null && i === selectedIdx && i !== correct){
      el.classList.remove('dim'); el.classList.add('wrong','big');
    }
    // disable click
    el.style.pointerEvents = 'none';
  });

  // scoring & counts
  if(!timedOut && selectedIdx === correct){
    score += 10;
    coins += 5;
    correctCount++;
    messageEl.textContent = 'সঠিক উত্তর! +10 পয়েন্ট';
    beep(880,0.08,0.06,'sine');
  } else {
    wrongCount++;
    messageEl.textContent = 'ভুল উত্তর!';
    beep(220,0.12,0.06,'sawtooth');
  }
  updateStatsUI();
  persistTinyPlayer(); // update live tiny display

  // after short delay go to next
  setTimeout(()=>{
    // remove spin class to allow next time spin
    const correctEl = choiceEls[Number(correct)];
    if(correctEl) correctEl.classList.remove('spin');
    currentIndex++;
    renderQuestion();
  },900);
}

// update top UI
function updatePlayerUI(){
  currentPlayerEl.textContent = playerName;
  coinsEl.textContent = `Coins: ${coins}`;
}
function updateStatsUI(){
  coinsEl.textContent = `Coins: ${coins}`;
  correctCountEl.textContent = `✔ ${correctCount}`;
  wrongCountEl.textContent = `✖ ${wrongCount}`;
  // update small stats persisted if needed
}

// leaderboard persistence (localStorage)
function getLeaderboard(){ try{ return JSON.parse(localStorage.getItem('quiz_leaderboard')||'[]'); }catch(e){ return []; } }
function saveLeaderboard(lb){ localStorage.setItem('quiz_leaderboard', JSON.stringify(lb)); }

function persistTinyPlayer(){
  // show current play immediately in leaderboard area as "ongoing"
  renderLeaderboard(); // ensure base list is shown
  const existing = document.getElementById('tiny-current');
  if(existing) existing.remove();
  const row = document.createElement('div');
  row.className = 'row';
  row.id = 'tiny-current';
  row.innerHTML = `<div class="name">${playerName} <small class="muted">(playing)</small></div><div class="points">${score} pts</div>`;
  leaderboardEl.prepend(row);
}

// when game ends, save to leaderboard cumulatively
function endGame(){
  stopTimer();
  messageEl.textContent = `গেম শেষ — ${playerName}, মোট স্কোর: ${score}`;
  // accumulate in leaderboard: add or update player's cumulative points
  const lb = getLeaderboard();
  const found = lb.find(r=> r.name === playerName);
  const now = new Date().toISOString();
  if(found){
    found.points = (found.points||0) + score;
    found.last = now;
  } else {
    lb.push({ name: playerName, points: score, last: now });
  }
  // sort by points desc
  lb.sort((a,b)=> b.points - a.points || new Date(b.last) - new Date(a.last));
  saveLeaderboard(lb);
  renderLeaderboard();
}

// render leaderboard on side
function renderLeaderboard(){
  const lb = getLeaderboard();
  leaderboardEl.innerHTML = '';
  // show top players
  if(lb.length === 0){
    leaderboardEl.innerHTML = '<div class="muted">No players yet</div>';
    return;
  }
  lb.forEach(r=>{
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<div class="name">${r.name}</div><div class="points">${r.points} pts</div>`;
    leaderboardEl.appendChild(row);
  });
}

// restart
restartBtn.addEventListener('click', ()=>{
  if(confirm('নতুন গেম শুরু করবেন? (বর্তমান স্কোর সেভ হবে)')){
    // show modal to enter name again or use same name
    nameModal.style.display = 'flex';
    playerNameInput.value = playerName;
  }
});
