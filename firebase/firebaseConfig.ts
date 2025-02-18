// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9Ic0wv0091RoZGWEODZKlQIQ6aQsL4Os",
  authDomain: "shower-thoughts-462e8.firebaseapp.com",
  projectId: "shower-thoughts-462e8",
  storageBucket: "shower-thoughts-462e8.firebasestorage.app",
  messagingSenderId: "291945376722",
  appId: "1:291945376722:web:224e59ad6b81617a0e360b",
  measurementId: "G-EFLTKXJLNK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export default db;
