// Firebase Config
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

const auth = firebase.auth();

// Signup function
function signup(){
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if(!email || !password){
        document.getElementById('auth-msg').innerText = "সব ফিল্ড পূরণ করুন";
        return;
    }

    auth.createUserWithEmailAndPassword(email,password)
    .then((userCredential)=>{
        document.getElementById('auth-msg').innerText = "সাইনআপ সফল হয়েছে!";
        startQuiz(userCredential.user);
    })
    .catch((error)=>{
        document.getElementById('auth-msg').innerText = error.message;
    });
}

// Login function
function login(){
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if(!email || !password){
        document.getElementById('auth-msg').innerText = "সব ফিল্ড পূরণ করুন";
        return;
    }

    auth.signInWithEmailAndPassword(email,password)
    .then((userCredential)=>{
        document.getElementById('auth-msg').innerText = "লগইন সফল হয়েছে!";
        startQuiz(userCredential.user);
    })
    .catch((error)=>{
        document.getElementById('auth-msg').innerText = error.message;
    });
}

// Optional logout
function logout(){
    auth.signOut().then(()=>{
        document.getElementById('auth-msg').innerText = "লগআউট হয়েছে!";
        location.reload();
    });
}
