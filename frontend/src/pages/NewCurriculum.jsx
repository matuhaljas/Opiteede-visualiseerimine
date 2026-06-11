import { useState } from 'react'
import { useParams } from 'react-router-dom'
import './NewCurriculum.css'
import './HomePage.css'

export default function NewCurriculum() {
  const { id } = useParams()
  const oppekavad = JSON.parse(localStorage.getItem("oppekavad") || "[]")
  const oppekava = oppekavad.find((ok) => ok.id === id)

  const [shareOpen, setShareOpen] = useState(false)
  const [muudaOpen, setMuudaOpen] = useState(false)
  const [filtridOpen, setFiltridOpen] = useState(false)
  const [publicAccess, setPublicAccess] = useState(false)
  const [nimi, setNimi] = useState(oppekava?.nimi ?? 'Uus õppekava')
  const [aasta, setAasta] = useState('2025/2026')
  const [tempNimi, setTempNimi] = useState('')
  const [tempAasta, setTempAasta] = useState('')
  const [filtrid, setFiltrid] = useState({ knowbits: true, skillbits: true, seosed: true })

  const avaMuuda = () => {
    setTempNimi(nimi)
    setTempAasta(aasta)
    setMuudaOpen(true)
  }

  const salvesta = () => {
    setNimi(tempNimi)
    setAasta(tempAasta)
    setMuudaOpen(false)
  }

  return (
    <div className="ncp">
      <div className="hp-topbar" />
      <header className="ncp-header">
        <div className="ncp-header-left">
          <a href="/dashboard" className="ncp-back">←</a>
          <div>
            <h1>{nimi}</h1>
            <span className="ncp-year">{aasta}</span>
          </div>
        </div>
        <div className="ncp-header-right">
          <span className="ncp-stat">● 0 KnowBits</span>
          <span className="ncp-stat green">● 0 SkillBits</span>
          <button className="ncp-btn">Ekspordi</button>
          <button className="ncp-btn">Impordi</button>
          <button className="ncp-btn" onClick={() => setShareOpen(true)}>Jaga</button>
          <button className="ncp-btn" onClick={avaMuuda}>Muuda</button>
        </div>
      </header>

      <div className="ncp-toolbar">
        <div className="ncp-search">
          <input type="text" placeholder="Otsi ühikuid..." />
        </div>
        <button className="ncp-btn ncp-btn-solid" onClick={() => setFiltridOpen(true)}>Filtrid</button>
      </div>

      <div className="ncp-tabs">
        <button className="ncp-tab active">Spiraalvaade (Makro)</button>
        <button className="ncp-tab">Õpitee Graaf (Mikro)</button>
      </div>

      <div className="ncp-canvas"></div>


      <footer className="footer" />

      <div className="ncp-footer-hint">
        Suumi hiire rattaga • Kliki ühikule seoste nägemiseks
      </div>

      {shareOpen && (
        <div className="modal-overlay" onClick={() => setShareOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Jaga projekti: {nimi}</h2>
                <p>Lisa kolleege või jaga projekti lingiga</p>
              </div>
              <button className="modal-close" onClick={() => setShareOpen(false)}>✕</button>
            </div>
            <div className="modal-section">
              <div className="modal-toggle-row">
                <div>
                  <strong>Avalik juurdepääs</strong>
                  <p>Igaüks lingiga saab projekti vaadata (ainult lugemisõigus)</p>
                </div>
                <div className={`toggle ${publicAccess ? 'on' : ''}`} onClick={() => setPublicAccess(!publicAccess)}></div>
              </div>
            </div>
            <div className="modal-section">
              <strong>Lisa kolleegid</strong>
              <div className="modal-invite">
                <input type="text" placeholder="kollegi@email.ee" />
                <select>
                  <option>Vaataja</option>
                  <option>Panustaja</option>
                  <option>Admin</option>
                </select>
                <button className="ncp-btn">+ Lisa</button>
              </div>
            </div>
            <div className="modal-rights">
              <strong>Õigused:</strong>
              <ul>
                <li><span className="blue">Vaataja</span> — saab projekti vaadata, ei saa muuta</li>
                <li><span className="blue">Panustaja</span> — saab lisada ja muuta ühikuid</li>
                <li><span className="blue">Admin</span> — saab projekti täielikult hallata ja jagada</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {muudaOpen && (
        <div className="modal-overlay" onClick={() => setMuudaOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div><h2>Muuda õppekava</h2></div>
              <button className="modal-close" onClick={() => setMuudaOpen(false)}>✕</button>
            </div>
            <div className="modal-section">
              <label>Nimi</label>
              <input className="modal-input" type="text" value={tempNimi} onChange={e => setTempNimi(e.target.value)} />
            </div>
            <div className="modal-section">
              <label>Aasta</label>
              <input className="modal-input" type="text" value={tempAasta} onChange={e => setTempAasta(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button className="ncp-btn" onClick={() => setMuudaOpen(false)}>Tühista</button>
              <button className="ncp-btn blue-btn" onClick={salvesta}>Salvesta</button>
            </div>
          </div>
        </div>
      )}

      {filtridOpen && (
        <div className="modal-overlay" onClick={() => setFiltridOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Filtrid</h2>
                <p>Vali mida spiraalvaates näidata</p>
              </div>
              <button className="modal-close" onClick={() => setFiltridOpen(false)}>✕</button>
            </div>
            <div className="modal-section">
              <div className="filter-row">
                <input type="checkbox" checked={filtrid.knowbits} onChange={e => setFiltrid({...filtrid, knowbits: e.target.checked})} />
                <span className="blue">KnowBits</span> — teadmisühikud
              </div>
              <div className="filter-row">
                <input type="checkbox" checked={filtrid.skillbits} onChange={e => setFiltrid({...filtrid, skillbits: e.target.checked})} />
                <span className="blue">SkillBits</span> — oskusühikud
              </div>
              <div className="filter-row">
                <input type="checkbox" checked={filtrid.seosed} onChange={e => setFiltrid({...filtrid, seosed: e.target.checked})} />
                <span className="blue">Seosed</span> — ühikutevahelised seosed
              </div>
            </div>
            <div className="modal-footer">
              <button className="ncp-btn blue-btn" onClick={() => setFiltridOpen(false)}>Rakenda</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}