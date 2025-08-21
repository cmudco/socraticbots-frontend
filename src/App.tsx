import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/auth/ProtectedRoute';
import StudentRoute from './components/auth/StudentRoute';
import Layout from './components/layout/Layout';
import About from './pages/About';
import AccessCodes from './pages/AccessCodes';
import BotGroups from './pages/BotGroups';
import Chat from './pages/Chat';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
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
            <Route path="bot-groups" element={<BotGroups />} />
            <Route path="chat" element={<Chat />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
  );
};

export default App;
