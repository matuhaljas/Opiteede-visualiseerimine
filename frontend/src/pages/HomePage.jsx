import './HomePage.css'

export default function HomePage() {
  return (
    <div className="home">
      <header className="home-header">
        <div className="home-logo">
          <span className="logo-icon"></span>
          <div>
            <h1>Ainekavade Visualiseerimine</h1>
          </div>
        </div>
      </header>

      <main className="home-main">
        <h2>Visualiseeri õppekava seoseid</h2>
        <p>Uuri teadmis- ja oskusühikute vahelisi seoseid spiraalvaate kaudu</p>
        <div className="home-btns">
          <a href="/login" className="btn-primary">Logi sisse</a>
        </div>
      </main>
    </div>
  )
}