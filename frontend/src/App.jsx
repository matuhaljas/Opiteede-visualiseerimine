import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import NewCurriculum from './pages/NewCurriculum'
import './App.css'
import ProjectPage from "./pages/ProjectPage";
import TestProjectPage from "./pages/TestProjectPage";
import TestProjectPage2 from "./pages/TestProjectPage2";
import TestProjectPage3 from "./pages/TestProjectPage3";
import Dashboard from './pages/Dashboard'
import { auth } from './firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'
import LoginPage from "./pages/LoginPage";

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  if (user === undefined) return null;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/project" element={<ProjectPage />} />
      <Route path="/test-project" element={<TestProjectPage />} />
      <Route path="/test-project2" element={<TestProjectPage2 />} />
      <Route path="/test-project3" element={<TestProjectPage3 />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/new/:id" element={<ProtectedRoute><NewCurriculum /></ProtectedRoute>} />

    </Routes>
  );
}

export default App;
