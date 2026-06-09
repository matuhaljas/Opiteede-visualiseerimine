import { initializeApp } from "firebase/app";
import { getAuth,GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCS_o13-Ois8-YG8QMGAK9Z-H3nJhgF52w",
  authDomain: "reactoauth-a851d.firebaseapp.com",
  projectId: "reactoauth-a851d",
  storageBucket: "reactoauth-a851d.firebasestorage.app",
  messagingSenderId: "354296375370",
  appId: "1:354296375370:web:ea1341db7aa66d2aac5eb3"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, db};