// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8K2B-out3gHxPAZ8egv7cCwxTnwVQrFc",
  authDomain: "reelagram-81560.firebaseapp.com",
  databaseURL: "https://reelagram-81560-default-rtdb.firebaseio.com",
  projectId: "reelagram-81560",
  storageBucket: "reelagram-81560.firebasestorage.app",
  messagingSenderId: "836309025458",
  appId: "1:836309025458:web:058e0e811f0e995e3abfab",
  measurementId: "G-TYXN3RRC0E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
