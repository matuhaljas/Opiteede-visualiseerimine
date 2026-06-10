import React from "react";
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NewCurriculum from './pages/NewCurriculum'
import './App.css'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
<<<<<<< HEAD
      <Route path="/new" element={<NewCurriculum />} />
=======
      <Route path="/dashboard" element={<Dashboard />} />
>>>>>>> 6b3f23a49c674c26751ca55db5a854f9c8e73db4
    </Routes>
  );
}

export default App;
