// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  initializeAuth,
  getReactNativePersistence,
  GoogleAuthProvider,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYpEA_4JpDYDPtMuldFuFSAbUS9a-Fb2Q",
  authDomain: "shower-thoughts-4998b.firebaseapp.com",
  projectId: "shower-thoughts-4998b",
  storageBucket: "shower-thoughts-4998b.firebasestorage.app",
  messagingSenderId: "949127998667",
  appId: "1:949127998667:web:f627e527d464f650ddbf4e",
  measurementId: "G-H8WECNYKG2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const provider = new GoogleAuthProvider();

export { analytics, auth, provider };
