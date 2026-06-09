import HomePage from './pages/HomePage'
import './App.css'
import { Link, Routes, Route } from 'react-router-dom'

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
