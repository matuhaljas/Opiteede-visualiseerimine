import React from "react";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebaseConfig";
import './HomePage.css'
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_BACK_URL ?? "http://localhost:8090";

function LoginPage() {
  const navigate = useNavigate();

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        lastLogin: new Date()
      });

      try {
        const res = await fetch(`${API}/api/auth/firebase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firebaseUid: user.uid,
            email: user.email,
            name: user.displayName
          })
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('jwt', data.token);
        }
      } catch {
        // backend kättesaamatu — jätkatakse ilma JWT-ta
      }

      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-logo">
          <div>
            <h1>Ainekavade Visualiseerimine</h1>
          </div>
        </div>
        <a href="/" className="login-btn">Tagasi Avalehele</a>
      </header>

      <main className="home-main">
        <h2>Logi sisse</h2>
        <div className="home-btns">
          <button onClick={loginWithGoogle} className="btn-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" className="google-icon">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            Logi sisse Googlega
          </button>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
