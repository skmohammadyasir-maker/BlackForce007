ঠিক আছে, আপনি Firebase Web SDK-এর config পেয়েছেন। এবার এই config ব্যবহার করে আপনার Quiz Game-এর auth.js ফাইল তৈরি করতে হবে।

নিচে আমি Ready-to-use auth.js দিচ্ছি যা আপনার Email/Password লগইন, সাইনআপ এবং startQuiz() function call করবে।


---

auth.js (Firebase Email/Password Auth)

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBC0mvjp67LkXyRqepDP7COVET0E0BRDzI",
  authDomain: "blackforce007-otp.firebaseapp.com",
  projectId: "blackforce007-otp",
  storageBucket: "blackforce007-otp.firebasestorage.app",
  messagingSenderId: "889099609974",
  appId: "1:889099609974:web:755f03e0bfbe7713213c57",
  measurementId: "G-MGNE019GVZ"
};
firebase.initializeApp(firebaseConfig);

// Firebase Auth reference
const auth = firebase.auth();

// Signup function
function signup(){
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if(email === "" || password === ""){
        document.getElementById('auth-msg').innerText = "সব ফিল্ড পূরণ করুন";
        return;
    }

    auth.createUserWithEmailAndPassword(email,password)
    .then((userCredential)=>{
        document.getElementById('auth-msg').innerText = "সাইনআপ সফল হয়েছে!";
        startQuiz(); // Quiz শুরু হবে
    })
    .catch((error)=>{
        document.getElementById('auth-msg').innerText = error.message;
    });
}

// Login function
function login(){
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if(email === "" || password === ""){
        document.getElementById('auth-msg').innerText = "সব ফিল্ড পূরণ করুন";
        return;
    }

    auth.signInWithEmailAndPassword(email,password)
    .then((userCredential)=>{
        document.getElementById('auth-msg').innerText = "লগইন সফল হয়েছে!";
        startQuiz(); // Quiz শুরু হবে
    })
    .catch((error)=>{
        document.getElementById('auth-msg').innerText = error.message;
    });
}

// Logout function (optional)
function logout(){
    auth.signOut().then(()=>{
        document.getElementById('auth-msg').innerText = "লগআউট হয়েছে!";
        location.reload(); // page refresh
    });
}


---

✅ পরবর্তী ধাপ

1. index.html ফাইলের login / signup button এ onclick="login()" বা onclick="signup()" যোগ করুন।


2. startQuiz() function আপনার script.js ফাইলে থাকবে, যা ৩০ র‍্যান্ডম প্রশ্ন লোড করবে।


3. Firebase Realtime Database setup করুন → Questions + Leaderboard + Admin roles।



> এখন আপনার Quiz Game Mobile/Browser থেকে সরাসরি Email/Password লগইন ব্যবহার করতে পারবে।



আপনি চাইলে আমি পরের ধাপে Quiz + Leaderboard + Admin Role ready script.js + leaderboard.js template বানিয়ে দিতে পারি, যা Firebase-এ কাজ করবে।

আপনি কি সেটা চাইবেন?

