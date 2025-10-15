let questions=[], currentQuestion=0, correctCount=0, wrongCount=0, coins=0, timerInterval, timeLeft=30, playerName="";
const nextBtn = document.getElementById("next-btn");

// Start Quiz function
async function startQuiz(user){
    playerName = user.email;
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("quiz-screen").classList.remove("hidden");
    document.getElementById("display-name").innerText = playerName;

    // Load questions
    const res = await fetch("questions.json");
    questions = await res.json();
    shuffleArray(questions);
    if(questions.length>30) questions = questions.slice(0,30);

    showQuestion();
    startTimer();
    loadLeaderboardFirebase();
}

// Show question
function showQuestion(){
    document.getElementById("options-container").innerHTML="";
    const q = questions[currentQuestion];
    document.getElementById("question-text").innerText = q.question;
    let shuffled = [...q.options];
    shuffleArray(shuffled);

    shuffled.forEach(option=>{
        const btn = document.createElement("button");
        btn.innerText = option;
        btn.classList.add("option");
        btn.addEventListener("click",()=>selectAnswer(btn,q.answer));
        document.getElementById("options-container").appendChild(btn);
    });

    nextBtn.classList.add("hidden");
}

// Select answer
function selectAnswer(btn, correctAns){
    const allOptions = document.querySelectorAll(".option");
    allOptions.forEach(b=>b.disabled=true);

    if(btn.innerText===correctAns){
        btn.classList.add("correct");
        correctCount++;
        coins+=10;
    } else{
        btn.classList.add("wrong");
        wrongCount++;
        allOptions.forEach(o=>{if(o.innerText===correctAns) o.classList.add("correct");});
    }

    document.getElementById("correct-count").innerText=correctCount;
    document.getElementById("wrong-count").innerText=wrongCount;
    document.getElementById("coins").innerText=coins;
    nextBtn.classList.remove("hidden");
}

// Next question
nextBtn.addEventListener("click",()=>{
    currentQuestion++;
    if(currentQuestion<questions.length){ showQuestion(); resetTimer(); }
    else { endGame(); }
});

// Timer
function startTimer(){
    timeLeft=30;
    document.getElementById("timer").innerText=timeLeft;
    timerInterval=setInterval(()=>{
        timeLeft--;
        document.getElementById("timer").innerText=timeLeft;
        if(timeLeft<=0){
            clearInterval(timerInterval);
            currentQuestion++;
            if(currentQuestion<questions.length){ showQuestion(); resetTimer(); }
            else{ endGame(); }
        }
    },1000);
}

function resetTimer(){ clearInterval(timerInterval); startTimer(); }
function shuffleArray(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } }

// End game
function endGame(){
    clearInterval(timerInterval);
    alert(`${playerName}, গেম শেষ! ✅\nসঠিক: ${correctCount} | ভুল: ${wrongCount} | কয়েন: ${coins}`);

    const user = firebase.auth().currentUser;
    if(user){
        firebase.database().ref('leaderboard/'+user.uid).set({
            name:playerName, coins:coins, correct:correctCount, wrong:wrongCount, timestamp:Date.now()
        });
    }

    // Reset
    currentQuestion=0; correctCount=0; wrongCount=0; coins=0;
    document.getElementById("quiz-screen").classList.add("hidden");
}

// Load leaderboard from Firebase
function loadLeaderboardFirebase(){
    firebase.database().ref('leaderboard').orderByChild('coins').limitToLast(10)
    .on('value', snapshot=>{
        const list=document.getElementById("leaderboard-list");
        list.innerHTML="";
        const players=[];
        snapshot.forEach(child=>players.push(child.val()));
        players.reverse();
        players.forEach((p,i)=>{
            const li=document.createElement("li");
            li.textContent=`${i+1}. ${p.name} — ${p.coins}💰`;
            list.appendChild(li);
        });
    });
}
