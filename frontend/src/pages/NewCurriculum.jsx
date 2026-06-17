// MUUDATUSED (11.06.26):
// - Õppekava nimi/aasta laetakse backendist (GET /api/curricula/{id}), mitte localStorage'ist
// - KnowBitid ja SkillBitid laetakse backendist (GET /api/knowbits?curriculumId, GET /api/skillbits?curriculumId)
// - "Lisa ühik" nupp teeb päris POST /api/knowbits või /api/skillbits (ei salvesta ainult state'i)
// - "Muuda → Salvesta" teeb PUT /api/curricula/{id} (nimi ja aasta salvestuvad DB-sse)
// - Lisatud "Aine" väli "Lisa ühik" modaalis (subject väli — spiraalvaade grupeerib aine järgi)
// - spiraalvaade saab pärisandmeid: knowbits+skillbits grupeeritakse aine kaupa → TestProjectPage2 data prop
// - Ekspordi/Impordi nupud kasutavad backendi (Jackson serialisatsioon)
// - Õpitee Graaf vaade lisatud (GraphView)
// - Ainete filter-riba lehe allosas
import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import './NewCurriculum.css'
import TestProjectPage2 from './TestProjectPage2'
import TestProjectPage3 from './TestProjectPage3'
import GraphView from './GraphView'

const API = import.meta.env.VITE_BACK_URL ?? 'http://localhost:8090'

const SUBJECT_COLORS = [0x7c8aff, 0x4ecfb3, 0xff8a65, 0xf06292, 0xa5d06a, 0xffd54f, 0x9575cd, 0x4fc3f7]

function hexCss(hex) {
  return '#' + hex.toString(16).padStart(6, '0')
}

export default function NewCurriculum() {
  const { id } = useParams()
  const importRef = useRef(null)

  const [importPreview, setImportPreview] = useState(null)  // { knowbits, skillbits, subjects, file }
  const [shareOpen, setShareOpen] = useState(false)
  const [muudaOpen, setMuudaOpen] = useState(false)
  const [filtridOpen, setFiltridOpen] = useState(false)
  const [lisaOpen, setLisaOpen] = useState(false)
  const [publicAccess, setPublicAccess] = useState(false)
  const [nimi, setNimi] = useState('Uus õppekava')
  const [aasta, setAasta] = useState('2025/2026')
  const [tempNimi, setTempNimi] = useState('')
  const [tempAasta, setTempAasta] = useState('')
  const [filtrid, setFiltrid] = useState({ knowbits: true, skillbits: true, seosed: true })
  const [aktiivsevahekaard, setAktiivsevahekaard] = useState('spiraal')
  const [knowbits, setKnowbits] = useState([])
  const [skillbits, setSkillbits] = useState([])
  const [otsing, setOtsing] = useState('')
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('VIEWER')
  const [uusYhik, setUusYhik] = useState({
    tyyyp: 'knowbit',
    pealkiri: '',
    kirjeldus: '',
    aine: '',
    klass: '1. klass',
    suvenemistase: 'Tase 1',
    olulisus: 'Määramata',
    markmed: ''
  })

  const laeYhikud = () => {
    if (!id) return
    fetch(`${API}/api/knowbits?curriculumId=${id}`)
      .then(res => res.json())
      .then(data => setKnowbits(data))
      .catch(() => { })
    fetch(`${API}/api/skillbits?curriculumId=${id}`)
      .then(res => res.json())
      .then(data => setSkillbits(data))
      .catch(() => { })
  }

  useEffect(() => {
    if (!id) return
    fetch(`${API}/api/curricula/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data?.name) setNimi(data.name)
        if (data?.year) setAasta(data.year)
      })
      .catch(() => { })
    laeYhikud()
  }, [id])

  // Kõik unikaalsed ained (järjestatud nagu nad esmakordselt esineda)
  const allSubjects = useMemo(() => {
    const seen = new Set()
    const result = []
      ;[...knowbits, ...skillbits].forEach(y => {
        const s = y.subject || 'Määramata'
        if (!seen.has(s)) { seen.add(s); result.push(s) }
      })
    return result
  }, [knowbits, skillbits])

  // Grupeeri kõik ühikud aine järgi spiraalvaate jaoks
  // selectedSubject dimib ainult Three.js-is — siin näitame kõiki aineid alati
  const spiraalData = useMemo(() => {
    const koik = [
      ...(filtrid.knowbits ? knowbits : []),
      ...(filtrid.skillbits ? skillbits : [])
    ]

    // Grupeeri aine järgi, aine sees klass järgi
    const grupid = new Map()
    koik.forEach(y => {
      const aine = y.subject || 'Määramata'
      const klass = y.gradeLevel || 'Määramata'
      if (!grupid.has(aine)) grupid.set(aine, new Map())
      const klassiMap = grupid.get(aine)
      if (!klassiMap.has(klass)) klassiMap.set(klass, [])
      klassiMap.get(klass).push({
        title: y.title,
        gradeLevel: klass,
        orderIndex: y.orderIndex ?? null
      })
    })

    const subjects = [...grupid.entries()].map(([name, klassiMap]) => {
      // Sorteeri klassid
      const sortedKlassid = [...klassiMap.entries()].sort((a, b) => {
        const n = s => parseInt(s[0]) || 99
        return n(a) - n(b)
      })

      // Iga klass = üks "ring" — topics on klassiti grupeeritud objektid
      const topics = sortedKlassid.flatMap(([klass, items]) =>
        items
          .sort((a, b) => (a.orderIndex ?? 99999) - (b.orderIndex ?? 99999))
          .map(t => t.title)
      )

      // klassipiirid indeksite kaupa (hiljem spiraalile ringide joonistamiseks)
      const klassiPiirid = []
      let offset = 0
      sortedKlassid.forEach(([klass, items]) => {
        klassiPiirid.push({ klass, start: offset, end: offset + items.length - 1 })
        offset += items.length
      })

      return {
        name,
        color: SUBJECT_COLORS[allSubjects.indexOf(name) % SUBJECT_COLORS.length],
        topics,
        klassiPiirid,
        topicDetails: sortedKlassid.flatMap(([_, items]) => items)
      }
    })

    if (!subjects.length) return null

    const details = {}
    subjects.forEach(s => {
      s.topicDetails.forEach(t => {
    details[t.title] = { 
    subject: s.name, 
    gradeLevel: t.gradeLevel, 
    outcomeCount: 1,
    description: t.description || ''
}
      })
    })

    return { subjects, details }
  }, [knowbits, skillbits, filtrid, allSubjects])

  const avaMuuda = () => {
    setTempNimi(nimi)
    setTempAasta(aasta)
    setMuudaOpen(true)
  }

  const salvesta = async () => {
    setNimi(tempNimi)
    setAasta(tempAasta)
    setMuudaOpen(false)
    if (!id) return
    try {
      await fetch(`${API}/api/curricula/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tempNimi, year: tempAasta })
      })
    } catch { /* võrgu viga ignoreeritakse */ }
  }

  const lisaYhik = async () => {
    if (!uusYhik.pealkiri.trim() || !id) return
    const endpoint = uusYhik.tyyyp === 'knowbit' ? 'knowbits' : 'skillbits'
    const payload = {
      title: uusYhik.pealkiri.trim(),
      description: uusYhik.kirjeldus,
      subject: uusYhik.aine,
      gradeLevel: uusYhik.klass,
      depthLevel: uusYhik.suvenemistase,
      importance: uusYhik.olulisus,
      notes: uusYhik.markmed,
      curriculumId: Number(id)
    }
    try {
      await fetch(`${API}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      laeYhikud()
      setLisaOpen(false)
      setUusYhik({ tyyyp: 'knowbit', pealkiri: '', kirjeldus: '', aine: '', klass: '1. klass', suvenemistase: 'Tase 1', olulisus: 'Määramata', markmed: '' })
    } catch {
      alert('Ühiku lisamine ebaõnnestus')
    }
  }

  const saadaKutse = async () => {
    if (!inviteEmail.trim() || !id) return
    try {
      const res = await fetch(`${API}/api/curricula/${id}/shares/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole, curriculumName: nimi })
      })
      if (!res.ok) {
        const text = await res.text()
        alert(`Kutse saatmine ebaõnnestus (${res.status}): ${text}`)
        return
      }
      setInviteEmail('')
      alert(`Kutse saadetud: ${inviteEmail}`)
    } catch (e) {
      alert(`Kutse saatmine ebaõnnestus: ${e.message}`)
    }
  }

  const ekspordi = async () => {
    if (!id) return
    try {
      const res = await fetch(`${API}/api/curricula/${id}/export`)
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${nimi}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Eksport ebaõnnestus')
    }
  }

  const onImportFileSelected = async e => {
    const file = e.target.files[0]
    if (!file || !id) return
    importRef.current.value = ''

    // Parse locally first to show a preview before uploading
    try {
      const text = await file.text()
      const json = JSON.parse(text)

      let knowbitCount = 0, skillbitCount = 0
      const subjectSet = new Set()

      if (json['@graph']) {
        // Mirror the backend walk: @graph → Subject (hasTopic) → Topic (hasOutcome, hasSkillBit, hasSubtopic)
        const countTopic = (topic) => {
          const outcomes = Array.isArray(topic.hasOutcome) ? topic.hasOutcome : []
          const skills = Array.isArray(topic.hasSkillBit) ? topic.hasSkillBit : []
          outcomes.forEach(o => { if (o.text_et || o.text) knowbitCount++ })
          skills.forEach(s => { if (s.name || s.text) skillbitCount++ })
          const subs = Array.isArray(topic.hasSubtopic) ? topic.hasSubtopic : []
          subs.forEach(countTopic)
        }

        json['@graph'].forEach(subject => {
          const rawName = subject.name
          const name = rawName?.['@value'] ?? rawName ?? null
          if (name) subjectSet.add(name)
          const topics = Array.isArray(subject.hasTopic) ? subject.hasTopic : []
          topics.forEach(countTopic)
        })
      } else {
        // Native export format
        knowbitCount = Array.isArray(json.knowbits) ? json.knowbits.length : 0
        skillbitCount = Array.isArray(json.skillbits) ? json.skillbits.length : 0
          ;[...(json.knowbits || []), ...(json.skillbits || [])].forEach(y => {
            if (y.subject) subjectSet.add(y.subject)
          })
      }

      setImportPreview({ knowbits: knowbitCount, skillbits: skillbitCount, subjects: [...subjectSet], file })
    } catch {
      alert('Faili lugemine ebaõnnestus — kontrolli, et fail on korrektne JSON või JSON-LD.')
    }
  }

  const confirmImport = async () => {
    if (!importPreview?.file || !id) return
    const form = new FormData()
    form.append('file', importPreview.file)
    setImportPreview(null)
    try {
      const res = await fetch(`${API}/api/curricula/${id}/import`, { method: 'POST', body: form })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      laeYhikud()
    } catch {
      alert('Import ebaõnnestus')
    }
  }

  return (
    <div className="ncp">
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
          <button className="ncp-btn" onClick={ekspordi}>Ekspordi</button>
          <button className="ncp-btn" onClick={() => importRef.current?.click()}>Impordi</button>
          <input ref={importRef} type="file" accept=".json,.jsonld" style={{ display: 'none' }} onChange={onImportFileSelected} />
          <button className="ncp-btn" onClick={() => setShareOpen(true)}>Jaga</button>
          <button className="ncp-btn" onClick={avaMuuda}>Muuda</button>
          <button className="ncp-btn blue-btn" onClick={() => setLisaOpen(true)}>+ Lisa ühik</button>
        </div>
      </header>

      <div className="ncp-toolbar">
        <div className="ncp-search">
          <input type="text" placeholder="Otsi ühikuid..." value={otsing} onChange={e => setOtsing(e.target.value)} />
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

      <div className="ncp-canvas" style={{ display: 'flex', flexDirection: 'column' }}>
        {aktiivsevahekaard === 'spiraal' && (
          <div style={{ width: '100%', height: '100%' }}>
            <TestProjectPage3 data={{ subjects: spiraalData?.subjects }} details={spiraalData?.details} />
          </div>
        )}
        {aktiivsevahekaard === 'opitee' && (
          <GraphView
            knowbits={knowbits}
            skillbits={skillbits}
            filtrid={filtrid}
            otsing={otsing}
            selectedSubject={selectedSubject}
          />
        )}
      </div>

      {/* Ainete valik — lehe allosas */}
      {allSubjects.length > 0 && (
        <div className="ncp-subjectbar">
          <span className="ncp-subjectbar-label">Ained:</span>
          <div
            className={`ncp-subject-chip${selectedSubject === null ? ' active' : ''}`}
            onClick={() => setSelectedSubject(null)}
          >
            <span className="ncp-subject-dot" style={{ background: '#003082' }} />
            <span>Kõik ained</span>
          </div>
          {allSubjects.map((subj, i) => {
            const color = hexCss(SUBJECT_COLORS[i % SUBJECT_COLORS.length])
            return (
              <div
                key={subj}
                className={`ncp-subject-chip${selectedSubject === subj ? ' active' : ''}`}
                style={selectedSubject === subj ? { color } : {}}
                onClick={() => setSelectedSubject(selectedSubject === subj ? null : subj)}
              >
                <span className="ncp-subject-dot" style={{ background: color }} />
                <span>{subj}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="ncp-footer-hint">
        Suumi hiire rattaga • Kliki ühikule seoste nägemiseks
      </div>

      <footer className="footer" />

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
                <input
                  type="text"
                  placeholder="kollegi@email.ee"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                />
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                  <option value="VIEWER">Vaataja</option>
                  <option value="CONTRIBUTOR">Panustaja</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button className="ncp-btn" onClick={saadaKutse}>+ Lisa</button>
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
                <input type="checkbox" checked={filtrid.knowbits} onChange={e => setFiltrid({ ...filtrid, knowbits: e.target.checked })} />
                <span className="blue">KnowBits</span> — teadmisühikud
              </div>
              <div className="filter-row">
                <input type="checkbox" checked={filtrid.skillbits} onChange={e => setFiltrid({ ...filtrid, skillbits: e.target.checked })} />
                <span className="blue">SkillBits</span> — oskusühikud
              </div>
              <div className="filter-row">
                <input type="checkbox" checked={filtrid.seosed} onChange={e => setFiltrid({ ...filtrid, seosed: e.target.checked })} />
                <span>Seosed</span> — ühikutevahelised seosed
              </div>
            </div>
            <div className="modal-footer">
              <button className="ncp-btn blue-btn" onClick={() => setFiltridOpen(false)}>Rakenda</button>
            </div>
          </div>
        </div>
      )}

      {importPreview && (
        <div className="modal-overlay" onClick={() => setImportPreview(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Impordi kontroll</h2>
                <p>Kontrolli andmed enne importimist</p>
              </div>
              <button className="modal-close" onClick={() => setImportPreview(null)}>✕</button>
            </div>
            <div className="modal-section">
              <div style={{ display: 'flex', gap: '24px', marginBottom: '12px' }}>
                <div style={{ textAlign: 'center', padding: '12px 20px', background: '#f0f4ff', borderRadius: '10px', minWidth: '100px' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#003082' }}>{importPreview.knowbits}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>KnowBits</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px 20px', background: '#f0fff4', borderRadius: '10px', minWidth: '100px' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2e7d32' }}>{importPreview.skillbits}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>SkillBits</div>
                </div>
              </div>
              {importPreview.subjects.length > 0 && (
                <div>
                  <strong style={{ fontSize: '0.85rem', color: '#4b5563' }}>Leitud ained ({importPreview.subjects.length}):</strong>
                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                    {importPreview.subjects.map(s => (
                      <span key={s} style={{ background: '#f4f5f7', border: '1px solid #dde2ea', borderRadius: '12px', padding: '3px 10px', fontSize: '0.78rem', color: '#374151' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {importPreview.knowbits === 0 && importPreview.skillbits === 0 && (
                <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem' }}>
                  ⚠️ Failist ei leitud ühtegi KnowBiti ega SkillBiti. Kontrolli faili formaati.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="ncp-btn" onClick={() => setImportPreview(null)}>Tühista</button>
              <button
                className="ncp-btn blue-btn"
                onClick={confirmImport}
                disabled={importPreview.knowbits === 0 && importPreview.skillbits === 0}
              >
                Impordi
              </button>
            </div>
          </div>
        </div>
      )}

      {lisaOpen && (
        <div className="modal-overlay" onClick={() => setLisaOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Lisa uus ühik</h2>
                <p>Täida väljad, et luua või muuta KnowBit või SkillBit ühikut</p>
              </div>
              <button className="modal-close" onClick={() => setLisaOpen(false)}>✕</button>
            </div>
            <div className="modal-section">
              <label>Ühiku tüüp</label>
              <select className="modal-input" value={uusYhik.tyyyp} onChange={e => setUusYhik({ ...uusYhik, tyyyp: e.target.value })}>
                <option value="knowbit">KnowBit (Teadmus)</option>
                <option value="skillbit">SkillBit (Oskus)</option>
              </select>
            </div>
            <div className="modal-section">
              <label>Pealkiri *</label>
              <input className="modal-input" type="text" placeholder="nt. Rütmimustrid" value={uusYhik.pealkiri} onChange={e => setUusYhik({ ...uusYhik, pealkiri: e.target.value })} />
            </div>
            <div className="modal-section">
              <label>Aine *</label>
              <select className="modal-input" value={uusYhik.aine} onChange={e => setUusYhik({ ...uusYhik, aine: e.target.value })}>
                <option value="">-- Vali aine --</option>
                {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="modal-section">
              <label>Kirjeldus</label>
              <input className="modal-input" type="text" placeholder="Lühike kirjeldus ühiku kohta" value={uusYhik.kirjeldus} onChange={e => setUusYhik({ ...uusYhik, kirjeldus: e.target.value })} />
            </div>
            <div className="modal-row">
              <div className="modal-section">
                <label>Klass *</label>
                <select className="modal-input" value={uusYhik.klass} onChange={e => setUusYhik({ ...uusYhik, klass: e.target.value })}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(k => (
                    <option key={k} value={`${k}. klass`}>{k}. klass</option>
                  ))}
                </select>
              </div>
              <div className="modal-section">
                <label>Süvenemise tase *</label>
                <select className="modal-input" value={uusYhik.suvenemistase} onChange={e => setUusYhik({ ...uusYhik, suvenemistase: e.target.value })}>
                  {[1, 2, 3, 4, 5].map(t => (
                    <option key={t} value={`Tase ${t}`}>Tase {t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-section">
              <label>Märkmed</label>
              <input className="modal-input" type="text" placeholder="Lisainformatsioon õppekava arendajatele..." value={uusYhik.markmed} onChange={e => setUusYhik({ ...uusYhik, markmed: e.target.value })} />
            </div>
            <div className="modal-footer">
              <button className="ncp-btn" onClick={() => setLisaOpen(false)}>Tühista</button>
              <button className="ncp-btn blue-btn" onClick={lisaYhik}>Lisa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
