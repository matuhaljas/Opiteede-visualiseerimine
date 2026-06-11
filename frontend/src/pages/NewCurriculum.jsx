import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './NewCurriculum.css'

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
  const [aktiivsevahekaard, setAktiivsevahekaard] = useState('spiraal')
  const [knowbits, setKnowbits] = useState([])
  const [skillbits, setSkillbits] = useState([])

  useEffect(() => {
    if (!id) return
    fetch(`http://localhost:8090/api/knowbits?curriculumId=${id}`)
      .then(res => res.json())
      .then(data => setKnowbits(data))
      .catch(() => {})
    fetch(`http://localhost:8090/api/skillbits?curriculumId=${id}`)
      .then(res => res.json())
      .then(data => setSkillbits(data))
      .catch(() => {})
  }, [id])

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
          <span className="ncp-stat">● {knowbits.length} KnowBits</span>
          <span className="ncp-stat green">● {skillbits.length} SkillBits</span>
          <button className="ncp-btn" onClick={() => {
            const data = { nimi, aasta, knowbits, skillbits }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${nimi}.json`
            a.click()
          }}>Ekspordi</button>
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
        <button
          className={`ncp-tab ${aktiivsevahekaard === 'spiraal' ? 'active' : ''}`}
          onClick={() => setAktiivsevahekaard('spiraal')}
        >Spiraalvaade (Makro)</button>
        <button
          className={`ncp-tab ${aktiivsevahekaard === 'opitee' ? 'active' : ''}`}
          onClick={() => setAktiivsevahekaard('opitee')}
        >Õpitee Graaf (Mikro)</button>
      </div>

      <div className="ncp-canvas">
        {aktiivsevahekaard === 'spiraal' && (
          <div className="canvas-placeholder">
            <p>Spiraalvaade tuleb siia</p>
          </div>
        )}
        {aktiivsevahekaard === 'opitee' && (
          <div className="canvas-placeholder">
            <p>Õpitee Graaf tuleb siia</p>
          </div>
        )}
      </div>


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
              <strong>Lisa kolleegiud</strong>
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
                <li><strong>Vaataja:</strong> Saab projektit vaadata</li>
                <li><strong>Panustaja:</strong> Saab projektit muuta</li>
                <li><strong>Admin:</strong> Täielik juurdepääs</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {muudaOpen && (
        <div className="modal-overlay" onClick={() => setMuudaOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Muuda õppekava</h2>
              <button className="modal-close" onClick={() => setMuudaOpen(false)}>✕</button>
            </div>
            <div className="modal-section">
              <label>Õppekava nimi</label>
              <input
                type="text"
                value={tempNimi}
                onChange={e => setTempNimi(e.target.value)}
              />
            </div>
            <div className="modal-section">
              <label>Õppeaasta</label>
              <input
                type="text"
                value={tempAasta}
                onChange={e => setTempAasta(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="ncp-btn" onClick={salvesta}>Salvesta</button>
              <button className="ncp-btn-secondary" onClick={() => setMuudaOpen(false)}>Tühista</button>
            </div>
          </div>
        </div>
      )}

      {filtridOpen && (
        <div className="modal-overlay" onClick={() => setFiltridOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Filtrid</h2>
              <button className="modal-close" onClick={() => setFiltridOpen(false)}>✕</button>
            </div>
            <div className="modal-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filtrid.knowbits}
                  onChange={e => setFiltrid({ ...filtrid, knowbits: e.target.checked })}
                />
                KnowBits
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filtrid.skillbits}
                  onChange={e => setFiltrid({ ...filtrid, skillbits: e.target.checked })}
                />
                SkillBits
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filtrid.seosed}
                  onChange={e => setFiltrid({ ...filtrid, seosed: e.target.checked })}
                />
                Seosed
              </label>
            </div>
            <div className="modal-actions">
              <button className="ncp-btn" onClick={() => setFiltridOpen(false)}>Valmis</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}