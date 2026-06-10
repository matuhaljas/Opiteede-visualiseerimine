import React, { useState, useRef } from "react";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import './HomePage.css'

function Dashboard() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [nimi, setNimi] = useState("");
  const dialogRef = useRef(null);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleLoo = () => {
    if (!nimi.trim()) return;
    console.log("Uus õppekava:", nimi);
    setNimi("");
    dialogRef.current.close();
  };

  const handleOpen = () => {
    dialogRef.current.showModal();
  };

  const handleClose = () => {
    setNimi("");
    dialogRef.current.close();
  };

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-logo">
          <span className="logo-icon">⬡</span>
          <div>
            <h1>Ainekavade Visualiseerimine</h1>
            <p className="home-p">Tere tulemast, {user?.displayName}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="login-btn">Logi välja</button>
      </header>

      <main>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 32px" }}>
          <button className="login-btn" onClick={handleOpen}>+ Uus õppekava</button>
        </div>
      </main>

      <dialog ref={dialogRef}>
        <p>Õppekava nimi</p>
        <input
          type="text"
          placeholder="Õppekava nimi"
          value={nimi}
          onChange={(e) => setNimi(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLoo()}
          autoFocus
        />
        <div>
          <button onClick={handleClose}>Tühista</button>
          <button onClick={handleLoo}>Loo</button>
        </div>
      </dialog>
    </div>
  );
}

export default Dashboard;
