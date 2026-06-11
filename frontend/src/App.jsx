import React from "react";
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage' // muutus: ./pages/ mitte ./
import './App.css'
import ProjectPage from "./pages/ProjectPage";
import TestProjectPage from "./pages/TestProjectPage";
import TestProjectPage2 from "./pages/TestProjectPage2";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/project" element={<ProjectPage />} />
      <Route path="/test-project" element={<TestProjectPage />} />
      <Route path="/test-project2" element={<TestProjectPage2 />} />
      
    </Routes>
  );
}

export default App;