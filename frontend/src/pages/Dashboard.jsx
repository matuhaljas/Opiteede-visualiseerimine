// MUUDATUSED (11.06.26):
// - Õppekavad liigutatud localStorage'ist backendi (GET /api/curricula?ownerUid)
// - Uue õppekava loomine teeb POST /api/curricula (ownerUid = Firebase auth.currentUser.uid)
// - Kaardid näitavad nüüd päris KnowBit/SkillBit arve backendist (mitte alati "0")
// - updatedAt kuupäev tuleb backendist
import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import './HomePage.css'

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [nimi, setNimi] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [oppekavad, setOppekavad] = useState([]);

  const laeOppekavad = () => {
    apiFetch('/api/curricula')
      .then((res) => res.json())
      .then((data) => setOppekavad(data))
      .catch(() => {});
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) laeOppekavad();
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('jwt');
    navigate("/");
  };

  const handleLoo = async () => {
    if (!nimi.trim()) return;
    try {
      const res = await apiFetch('/api/curricula', {
        method: "POST",
        body: JSON.stringify({ name: nimi.trim(), year: "2025/2026" }),
      });
      const uus = await res.json();
      setModalOpen(false);
      navigate(`/new/${uus.id}`);
    } catch {
      alert("Õppekava loomine ebaõnnestus");
    }
  };

  const handleOpen = () => {
    setNimi("");
    setModalOpen(true);
  };

  const handleClose = () => {
    setNimi("");
    setModalOpen(false);
  };

  const formatKuupaev = (iso) =>
    iso ? new Date(iso).toLocaleDateString("et-EE") : "";

  return (
    <div className="home">
      <div className="home-topbar" />
      <header className="home-header">
        <div className="home-logo">
          <span className="logo-icon">⬡</span>
          <div>
            <h1>Ainekavade Visualiseerimine</h1>
            <p className="home-p">Tere tulemast, {user?.displayName}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="hp-btn-solid">Logi välja</button>
      </header>

      <main>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 32px" }}>
          <button className="hp-btn" onClick={handleOpen}>+ Uus õppekava</button>
        </div>
        <div style={{ padding: "0 32px" }}>
          <h2>Minu Projektid</h2>
          <div className="projekt-grid">
            {oppekavad.map((ok) => (
              <div key={ok.id} className="projekt-kaart" onClick={() => navigate(`/new/${ok.id}`)}>
                <div className="projekt-kaart-top">
                  <h3>{ok.name}</h3>
                </div>
                <p className="projekt-kuupaev">Viimati muudetud: {formatKuupaev(ok.updatedAt)}</p>
                <div className="projekt-bitid">
                  <span className="projekt-knowbit">● {ok.knowBitCount} KnowBits</span>
                  <span className="projekt-skillbit">● {ok.skillBitCount} SkillBits</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer" />

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
