import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RootLayout } from './layouts/RootLayout';
import { About } from './pages/About';
import { Login } from './pages/Auth/Login';
import { Dashboard } from './pages/Dashboard';
import { Register } from './pages/Auth/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Books } from './pages/Books';
import { Chapters } from './pages/Chapters';
import { BookDetail } from './pages/BookDetail';
import { ChapterDetail } from './pages/ChapterDetail';
import './App.css';


function App() {
  return (
    <AuthProvider>
      <Router>
        <RootLayout>
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
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
            <Route 
              path="/chapters" 
              element={
                <ProtectedRoute>
                  <Chapters />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/books/:id"
              element={
                <ProtectedRoute>
                  <BookDetail />
                </ProtectedRoute>
              }
            />
            <Route path="/books/:bookId/chapters/:chapterId" element={
              <ProtectedRoute>
                <ChapterDetail />
              </ProtectedRoute>
            } />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </RootLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;