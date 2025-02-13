import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import Sidebar from './components/sidebar/Sidebar';
import Home from './components/screens/Home';
import Login from './components/screens/Login';
import Register from './components/screens/Register';
import Books from './components/books';
import { useAuthContext } from './contexts/AuthContext';
import { NAVIGATION_ITEMS } from './types/navigation';
import Settings from './components/screens/Settings';
import ThemeProvider from './providers/ThemeProvider';

function App() {
    const user = useAuthContext();

    if (!user) {
        return (
            <BrowserRouter>
                <Routes>
                    {NAVIGATION_ITEMS
                        .filter(item => !item.requiresAuth)
                        .map(item => (
                            <Route 
                                key={item.path} 
                                path={item.path} 
                                element={getComponent(item.path)} 
                            />
                        ))}
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>
        );
    }

    return (
        <ThemeProvider>
        <BrowserRouter>
            <div className="min-h-screen bg-gray-100">
                <Header />
                <Sidebar />
                
                <main className="ml-64 pt-14"> 
                    <div className="p-4"> 
                        <Routes>
                            {NAVIGATION_ITEMS
                                .filter(item => item.requiresAuth)
                                .map(item => (
                                    <Route 
                                        key={item.path} 
                                        path={item.path} 
                                        element={getComponent(item.path)} 
                                    />
                                ))}
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </BrowserRouter>
        </ThemeProvider>
    );
}

// Helper function to get the component based on path
const getComponent = (path: string) => {
    switch (path) {
        case '/':
            return <Home />;
        case '/books':
            return <Books />;
        case '/settings':
            return <Settings />;
        case '/login':
            return <Login />;
        case '/register':
            return <Register />;
        default:
            return <Navigate to="/" />;
    }
};

export default App;
