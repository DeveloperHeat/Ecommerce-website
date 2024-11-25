import { initializeApp } from "firebase/app";
import { getDatabase, set, ref } from "firebase/database";

import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { sendPasswordResetEmail } from "firebase/auth";

// ...

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA158FVgsXX3KVvkPBP2N8A2ATkGYEkg2g",
  authDomain: "ecommerce-11607.firebaseapp.com",
  databaseURL:
    "https://ecommerce-11607-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ecommerce-11607",
  storageBucket: "ecommerce-11607.appspot.com",
  messagingSenderId: "874853528359",
  appId: "1:874853528359:web:a069846a2149ddcfc8ef02",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { database, ref, auth, set, sendPasswordResetEmail };
