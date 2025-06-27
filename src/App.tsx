// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ReactQueryProvider } from './providers/ReactQueryProvider';
import { ApiProvider } from './providers/ApiProvider';
import { useAuthInitialization } from './hooks/queries/useAuthInitialization';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Books from './pages/Books';
import Chat from './pages/Chat';

// Auth initialization component
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useAuthInitialization();
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ReactQueryProvider>
      <ApiProvider>
        <AuthInitializer>
          <BrowserRouter>
            <Routes>
              {/* Public route - no layout */}
              <Route path="/login" element={<Login />} />

              {/* Protected routes with shared layout */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
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
      </ApiProvider>
    </ReactQueryProvider>
  );
};

export default App;
