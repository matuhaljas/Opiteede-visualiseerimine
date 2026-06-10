import './NewCurriculum.css'

export default function NewCurriculum() {
  return (
    <div className="nc">
      <header className="nc-header">
        <div className="nc-header-left">
          <a href="/dashboard" className="nc-back">←</a>
          <div>
            <h1>Uus õppekava</h1>
            <span className="nc-year">2025/2026</span>
          </div>
        </div>
        <div className="nc-header-right">
          <span className="nc-stat">● 0 KnowBits</span>
          <span className="nc-stat green">● 0 SkillBits</span>
          <button className="nc-btn">Ekspordi</button>
          <button className="nc-btn">Impordi</button>
          <button className="nc-btn">Jaga</button>
          <button className="nc-btn">Muuda</button>
        </div>
      </header>

      <div className="nc-toolbar">
        <div className="nc-search">
          <span></span>
          <input type="text" placeholder="Otsi ühikuid..." />
        </div>
        <button className="nc-btn">Filtrid</button>
      </div>

      <div className="nc-tabs">
        <button className="nc-tab active">Spiraalvaade (Makro)</button>
        <button className="nc-tab">Õpitee Graaf (Mikro)</button>
      </div>

      <div className="nc-canvas">
        {/* Spiraal tuleb siia */}
      </div>

      <div className="nc-sidebar">
        <strong>Ained:</strong>
      </div>

      <div className="nc-footer-hint">
        Suumi hiire rattaga • Kliki ühikule seoste nägemiseks
      </div>
    </div>
  )
}