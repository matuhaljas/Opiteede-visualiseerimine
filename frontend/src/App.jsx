import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import NewCurriculum from './pages/NewCurriculum'
import './App.css'
import Dashboard from './pages/Dashboard'
import { auth } from './firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'

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
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/new/:id" element={<ProtectedRoute><NewCurriculum /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
