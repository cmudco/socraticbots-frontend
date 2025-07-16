import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/auth/ProtectedRoute';
import StudentRoute from './components/auth/StudentRoute';
import Layout from './components/layout/Layout';
import { useAuthInitialization } from './hooks/queries/useAuthInitialization';
import About from './pages/About';
import AccessCodes from './pages/AccessCodes';
import Books from './pages/Books';
import Chat from './pages/Chat';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useAuthInitialization();
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthInitializer>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route
              path="access-codes"
              element={
                <StudentRoute>
                  <AccessCodes />
                </StudentRoute>
              }
            />
            <Route path="settings" element={<Settings />} />
            <Route path="books" element={<Books />} />
            <Route path="chat" element={<Chat />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthInitializer>
  );
};

export default App;
