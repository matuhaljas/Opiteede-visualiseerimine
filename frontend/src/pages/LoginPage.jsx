import React from "react";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebaseConfig";
import './HomePage.css'

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
    <div className="home">
      <header className="home-header">
        <div className="home-logo">
          <span className="logo-icon">⬡</span>
          <div>
            <h1>Ainekavade Visualiseerimine</h1>
          </div>
        </div>
        <a href="/" className="login-btn">Tagasi</a>
      </header>

      <main className="home-main">
        <h2>Logi sisse</h2>
        <div className="home-btns">
          <button onClick={loginWithGoogle} className="btn-primary">
            Logi sisse Googlega
          </button>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;