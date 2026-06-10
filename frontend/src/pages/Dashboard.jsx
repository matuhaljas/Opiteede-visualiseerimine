import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import './HomePage.css'

function Dashboard() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [nimi, setNimi] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [oppekavad, setOppekavad] = useState(() =>
    JSON.parse(localStorage.getItem("oppekavad") || "[]")
  );

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleLoo = () => {
    if (!nimi.trim()) return;
    const uus = { id: Date.now().toString(), nimi: nimi.trim(), loodud: new Date().toLocaleDateString("et-EE") };
    const uuedOppekavad = [...oppekavad, uus];
    localStorage.setItem("oppekavad", JSON.stringify(uuedOppekavad));
    setOppekavad(uuedOppekavad);
    setModalOpen(false);
    navigate(`/new/${uus.id}`);
  };

  const handleOpen = () => {
    setNimi("");
    setModalOpen(true);
  };

  const handleClose = () => {
    setNimi("");
    setModalOpen(false);
  };

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-logo">
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
          <div className="projekt-grid">
            {oppekavad.map((ok) => (
              <div key={ok.id} className="projekt-kaart" onClick={() => navigate(`/new/${ok.id}`)}>
                <div className="projekt-kaart-top">
                  <h3>{ok.nimi}</h3>
                  <span className="projekt-staatus">⏱ Pooleli</span>
                </div>
                <p className="projekt-kuupaev">Viimati muudetud: {ok.loodud}</p>
                <div className="projekt-bitid">
                  <span className="projekt-knowbit">● 0 KnowBits</span>
                  <span className="projekt-skillbit">● 0 SkillBits</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {modalOpen && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Uus õppekava</h2>
              <button className="modal-close" onClick={handleClose}>✕</button>
            </div>
            <div className="modal-section">
              <input
                className="modal-input"
                type="text"
                placeholder="Õppekava nimi"
                value={nimi}
                onChange={(e) => setNimi(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLoo()}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="modal-btn" onClick={handleClose}>Tühista</button>
              <button className="modal-btn modal-btn-primary" onClick={handleLoo}>Loo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
