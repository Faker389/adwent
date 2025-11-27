// Import the functions you need from the SDKs you need
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, GoogleAuthProvider } from "firebase/auth";
import { doc, Firestore, getFirestore, setDoc } from "firebase/firestore";
import { AppUser } from "./userModel";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey:process.env.NEXT_PUBLIC_apiKey  ,
  authDomain:process.env.NEXT_PUBLIC_authDomain  ,
  projectId:process.env.NEXT_PUBLIC_projectId  ,
  storageBucket:process.env.NEXT_PUBLIC_storageBucket  ,
  messagingSenderId:process.env.NEXT_PUBLIC_messagingSenderId  ,
  appId:process.env.NEXT_PUBLIC_appId ,
  measurementId:process.env.NEXT_PUBLIC_measurementId 
};
let app: FirebaseApp
let auth: Auth
let db: Firestore
export function getCurrentUser() {
  return new Promise((resolve) => {
    const unsub = auth.onAuthStateChanged((user) => {
      unsub();
      resolve(user);
    });
  });
}
if (typeof window !== "undefined") {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
}

export { app, auth, db, }

