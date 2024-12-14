import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RootLayout } from './layouts/RootLayout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Login } from './pages/Auth/Login';
import { Dashboard } from './pages/Dashboard';
import './App.css';


function App() {
  return (
    <AuthProvider>
      <Router>
        <RootLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </RootLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;