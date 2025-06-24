// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7Jtvt6ZVde2a_btiOboTE-jxvqRqDR60",
  authDomain: "spotify-341f6.firebaseapp.com",
  projectId: "spotify-341f6",
  storageBucket: "spotify-341f6.firebasestorage.app",
  messagingSenderId: "613463290746",
  appId: "1:613463290746:web:46310533fc00fd605f9cc3",
  measurementId: "G-15QTBX40QY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app); 
export const db = getFirestore(app); 