import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCtBHVg3FI4C3i1WKl_iNpB9lS-xTOT73I",
  authDomain: "reelgram-6636b.firebaseapp.com",
  projectId: "reelgram-6636b",
  storageBucket: "reelgram-6636b.firebasestorage.app",
  messagingSenderId: "1019099169791",
  appId: "1:1019099169791:web:520d4ad670a4c00bd2ddca"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
