import './App.css'

function App() {

  return (
    <>
      <Link to="/">
        <button>Avalehele</button>
      </Link>

      <Routes>
        <Route path="/" element={ <HomePage /> } />
      </Routes>
    </>
  )
}

export default App
