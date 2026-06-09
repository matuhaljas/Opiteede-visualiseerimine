import './HomePage.css'

export default function HomePage() {
  return (
    <div className="home">
      <header className="home-header">
        <div className="home-logo">
          <span className="logo-icon">⬡</span>
          <div>
            <h1>Ainekavade Visualiseerimine</h1>
          </div>
        </div>
        <a href="/login" className="login-btn">Logi sisse</a>
      </header>

      <main className="home-main">
        <h2>Visualiseeri õppekava seosed</h2>
        <p>Uuri teadmis- ja oskusühikute vahelisi seoseid spiraalvaate kaudu</p>
        <div className="home-btns">
          <a href="/login" className="btn-primary">Logi sisse</a>
          <a href="/register" className="btn-secondary">Registreeru</a>
        </div>
      </main>
    </div>
  )
}