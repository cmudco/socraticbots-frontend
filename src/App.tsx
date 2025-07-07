// src/App.tsx
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import { useAuthInitialization } from './hooks/queries/useAuthInitialization';
import About from './pages/About';
import Books from './pages/Books';
import Chat from './pages/Chat';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';

// Auth initialization component
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useAuthInitialization();
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthInitializer>
      <BrowserRouter>
        <Routes>
          {/* Public routes - no layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes with shared layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Nested routes - these render in the Layout's Outlet */}
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="settings" element={<Settings />} />
            <Route path="books" element={<Books />} />
            <Route path="chat" element={<Chat />} />
          </Route>

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthInitializer>
  );
};

export default App;
