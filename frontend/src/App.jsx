import React from "react";
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage' // muutus: ./pages/ mitte ./
import './App.css'
import ProjectPage from "./pages/ProjectPage";
import TestProjectPage from "./pages/TestProjectPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/project" element={<ProjectPage />} />
      <Route path="/test-project" element={<TestProjectPage />} />
      
    </Routes>
  );
}

export default App;