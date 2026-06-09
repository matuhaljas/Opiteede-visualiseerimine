import React from "react";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebaseConfig";
import HomePage from './pages/HomePage'
import './App.css'
import { Routes, Route } from 'react-router-dom'

function LoginPage() {
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        lastLogin: new Date()
      });
      alert(`Welcome ${user.displayName}`);
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Logi sisse</h1>
      <button onClick={loginWithGoogle}>Logi sisse Googlega</button>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;