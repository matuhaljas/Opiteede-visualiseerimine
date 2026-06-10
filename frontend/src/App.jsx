import React from "react";
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NewCurriculum from './pages/NewCurriculum'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/new" element={<NewCurriculum />} />
    </Routes>
  );
}

export default App;