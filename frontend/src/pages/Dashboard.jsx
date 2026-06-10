import React, { useState, useRef } from "react";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import './HomePage.css'

function Dashboard() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [nimi, setNimi] = useState("");
  const [oppekavad, setOppekavad] = useState(() =>
    JSON.parse(localStorage.getItem("oppekavad") || "[]")
  );
  const dialogRef = useRef(null);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleLoo = () => {
    if (!nimi.trim()) return;
    const uus = { id: Date.now().toString(), nimi: nimi.trim() };
    const uuedOppekavad = [...oppekavad, uus];
    localStorage.setItem("oppekavad", JSON.stringify(uuedOppekavad));
    setOppekavad(uuedOppekavad);
    dialogRef.current.close();
    navigate(`/new/${uus.id}`);
  };

  const handleOpen = () => {
    setNimi("");
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
        <div style={{ padding: "0 32px" }}>
          <h2>Minu Projektid</h2>
          <ul>
            {oppekavad.map((ok) => (
              <li key={ok.id}>
                <button className="login-btn" onClick={() => navigate(`/new/${ok.id}`)}>
                  {ok.nimi}
                </button>
              </li>
            ))}
          </ul>
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
