// src/App.tsx
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Books from './pages/Books';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/about" 
                element={
                  <ProtectedRoute>
                    <About />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/books" 
                element={
                  <ProtectedRoute>
                    <Books />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all - redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
};

export default App;
