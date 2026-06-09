import React from "react";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebaseConfig";

function App() {

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

export default App;
