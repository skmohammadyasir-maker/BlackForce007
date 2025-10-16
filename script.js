/**********************************************************************
 script.js — Black Force 007 Quiz Engine (ready-to-use, updated)
**********************************************************************/

/* ---------- CONFIG ---------- */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBC0mvjp67LkXyRqepDP7COVET0E0BRDzI",
  authDomain: "blackforce007-otp.firebaseapp.com",
  projectId: "blackforce007-otp",
  storageBucket: "blackforce007-otp.firebasestorage.app",
  messagingSenderId: "889099609974",
  appId: "1:889099609974:web:755f03e0bfbe7713213c57",
  measurementId: "G-MGNE019GVZ"
};

/* ---------- INIT FIREBASE ---------- */
let firebaseEnabled = false;
if(FIREBASE_CONFIG){
  firebase.initializeApp(FIREBASE_CONFIG);
  firebaseEnabled = true;
  console.log("✅ Firebase connected!");
}

/* ---------- GLOBALS ---------- */
const TOTAL_QUESTIONS = 30;
const TIME_PER_Q = 20;
const COLORS = ["#ff6b35","#ffd54a","#6bcB77","#4dabf7","#a55eea"]; // 5 colors

let pool = [];
let currentIndex = 0;
let currentQuestion = null;
let correctCount = 0;
let wrongCount = 0;
let score = 0;
let coins = 0;
let timer = TIME_PER_Q;
let timerInterval = null;
let answered = false;

let player = { name: "Guest", uid: null };
const bestLocalKey = 'bf007_best_score';

/* ---------- DOM ELEMENTS ---------- */
const authPanel = document.getElementById('auth-panel');
const gamePanel = document.getElementById('game-panel');
const resultPanel = document.getElementById('result-panel');
const leaderboardList = document.getElementById('leaderboard-list');

const sndClick = document.getElementById('snd-click');
const sndCorrect = document.getElementById('snd-correct');
const sndWrong = document.getElementById('snd-wrong');

const qIndexEl = document.getElementById('q-index');
const qTotalEl = document.getElementById('q-total');
const qTextEl = document.getElementById('question-text');
const optionsEl = document.getElementById('options');

const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const displayNameEl = document.getElementById('display-name');
const correctCountEl = document.getElementById('correct-count');
const wrongCountEl = document.getElementById('wrong-count');

const nextBtn = document.getElementById('nextBtn');
const replayBtn = document.getElementById('replayBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userEmailEl = document.getElementById('user-email');
const authMsg = document.getElementById('auth-msg');

/* ---------- UTILITY ---------- */
function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } }
function playSound(el){ try{ el.currentTime=0; el.play(); }catch(e){} }

/* ---------- AUTH ---------- */
async function signup(){
  if(!firebaseEnabled){ authMsg.innerText='Firebase disabled.'; return; }
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if(!email || !password){ authMsg.innerText='সব ফিল্ড পূরণ করুন'; return; }
  try{
    const res = await firebase.auth().createUserWithEmailAndPassword(email,password);
    onAuthSuccess(res.user);
  }catch(err){ authMsg.innerText = err.message; }
}

async function login(){
  if(!firebaseEnabled){ authMsg.innerText='Firebase disabled.'; return; }
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if(!email || !password){ authMsg.innerText='সব ফিল্ড পূরণ করুন'; return; }
  try{
    const res = await firebase.auth().signInWithEmailAndPassword(email,password);
    onAuthSuccess(res.user);
  }catch(err){ authMsg.innerText = err.message; }
}

function logout(){
  if(firebaseEnabled){ firebase.auth().signOut().catch(()=>{}); }
  location.reload();
}

function startAsGuest(){
  player = { name: "Guest", uid: null };
  beginGame();
}

function onAuthSuccess(user){
  player = { name: user.email || ('User-'+user.uid.slice(0,6)), uid: user.uid };
  userEmailEl.innerText = player.name;
  logoutBtn.classList.remove('hidden');
  authPanel.classList.add('hidden');
  beginGame();
}

/* Firebase listener */
if(firebaseEnabled){
  firebase.auth().onAuthStateChanged(u=>{
    if(u) onAuthSuccess(u);
  });
}

/* ---------- GAME ---------- */
function beginGame(){
  pool = [...QUESTIONS];
  shuffle(pool);
  if(pool.length > TOTAL_QUESTIONS) pool = pool.slice(0,TOTAL_QUESTIONS);
  currentIndex=0; correctCount=0; wrongCount=0; score=0; coins=0;
  updateUI();
  showCurrent();
  gamePanel.classList.remove('hidden');
  resultPanel.classList.add('hidden');
  authPanel.classList.add('hidden');
}

function updateUI(){
  qTotalEl.innerText = pool.length;
  scoreEl.innerText = score;
  coinsEl.innerText = coins;
  correctCountEl.innerText = correctCount;
  wrongCountEl.innerText = wrongCount;
  displayNameEl.innerText = player.name;
}

function showCurrent(){
  clearTimer();
  resetOptions();
  answered=false;
  currentQuestion = pool[currentIndex];
  qIndexEl.innerText = currentIndex+1;
  qTextEl.innerText = currentQuestion.question;

  let opts = [...currentQuestion.options];
  shuffle(opts);
  opts.forEach((opt,i)=>{
    const btn = document.createElement('button');
    btn.className = 'btn-option';
    btn.style.borderColor = COLORS[i%COLORS.length];
    btn.innerText = opt;
    btn.onclick = ()=>onSelect(btn,opt);
    optionsEl.appendChild(btn);
  });

  startTimer();
}

function resetOptions(){
  optionsEl.innerHTML='';
  nextBtn.classList.add('hidden');
  replayBtn.classList.add('hidden');
}

/* ---------- SELECT ANSWER ---------- */
function onSelect(btn, selected){
  if(answered) return;
  answered=true;
  playSound(sndClick);
  Array.from(optionsEl.children).forEach(b=>b.disabled=true);
  const isCorrect = (selected === currentQuestion.answer);
  if(isCorrect){
    btn.classList.add('correct');
    playSound(sndCorrect);
    correctCount++; score+=10; coins+=10;
  }else{
    btn.classList.add('wrong');
    playSound(sndWrong);
    wrongCount++;
    Array.from(optionsEl.children).forEach(b=>{
      if(b.innerText === currentQuestion.answer) b.classList.add('correct');
    });
  }
  updateUI();
  nextBtn.classList.remove('hidden');
}

/* ---------- TIMER ---------- */
function startTimer(){
  timer = TIME_PER_Q;
  timerEl.innerText = timer;
  timerInterval = setInterval(()=>{
    timer--;
    timerEl.innerText = timer;
    if(timer<=0){
      clearInterval(timerInterval);
      if(!answered){
        answered=true;
        wrongCount++; playSound(sndWrong);
        Array.from(optionsEl.children).forEach(b=>{
          if(b.innerText === currentQuestion.answer) b.classList.add('correct');
          b.disabled=true;
        });
        updateUI();
        nextBtn.classList.remove('hidden');
      }
    }
  },1000);
}

function clearTimer(){ if(timerInterval) clearInterval(timerInterval); }

/* ---------- NEXT / REPLAY ---------- */
function onNext(){
  clearTimer();
  currentIndex++;
  if(currentIndex < pool.length) showCurrent();
  else finishGame();
}

function replay(){
  shuffle(QUESTIONS);
  beginGame();
}

/* ---------- FINISH ---------- */
function finishGame(){
  clearTimer();
  document.getElementById('res-name').innerText = player.name;
  document.getElementById('res-correct').innerText = correctCount;
  document.getElementById('res-wrong').innerText = wrongCount;
  document.getElementById('res-score').innerText = score;
  const prevBest = parseInt(localStorage.getItem(bestLocalKey) || '0',10);
  if(score>prevBest) localStorage.setItem(bestLocalKey,score);
  document.getElementById('best-score').innerText = Math.max(score,prevBest);
  gamePanel.classList.add('hidden');
  resultPanel.classList.remove('hidden');
  replayBtn.classList.remove('hidden');

  if(firebaseEnabled && player.uid){
    const db = firebase.database();
    db.ref('leaderboard/'+player.uid).set({
      name: player.name,
      score: score,
      coins: coins,
      correct: correctCount,
      wrong: wrongCount,
      ts: Date.now()
    }).catch(()=>{});
  }
}

/* ---------- LEADERBOARD ---------- */
function loadLeaderboard(){
  if(firebaseEnabled){
    firebase.database().ref('leaderboard').orderByChild('score').limitToLast(10).on('value', snap=>{
      const arr=[];
      snap.forEach(c=>arr.push(c.val()));
      arr.reverse();
      renderLeaderboard(arr);
    });
  }else{
    const localBest = parseInt(localStorage.getItem(bestLocalKey)||'0',10);
    renderLeaderboard([{name:'Local Best', score:localBest}]);
  }
}

function renderLeaderboard(arr){
  leaderboardList.innerHTML='';
  if(!arr || arr.length===0){ leaderboardList.innerHTML='<li class="muted">No scores yet</li>'; return; }
  arr.forEach((p,i)=>{
    const li=document.createElement('li');
    li.innerText=`${i+1}. ${p.name} — ${p.score || 0} 💰`;
    leaderboardList.appendChild(li);
  });
}

/* ---------- INIT ---------- */
(function init(){
  document.getElementById('guestPlay').addEventListener('click', startAsGuest);
  nextBtn.addEventListener('click', onNext);
  replayBtn.addEventListener('click', replay);
  qTotalEl.innerText = TOTAL_QUESTIONS;
  loadLeaderboard();
})();
