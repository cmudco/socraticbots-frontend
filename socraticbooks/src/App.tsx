import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import Sidebar from './components/sidebar/Sidebar';
import Home from './components/screens/Home';
import Login from './components/screens/Login';
import Register from './components/screens/Register';
import Books from './components/books';
import Chat from './components/chat';
import { useAuthContext } from './contexts/AuthContext';
import { NAVIGATION_ITEMS } from './types/navigation';
import Settings from './components/screens/Settings';
import AccessCodes from './components/screens/AccessCodes';
import ThemeProvider from './providers/ThemeProvider';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';

// Create a wrapper component for the authenticated content
const AuthenticatedApp = () => {
    const { isCollapsed } = useSidebar();

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <Sidebar />
            
            <main className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'} pt-14`}> 
                <div className=""> 
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
    );
};

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
            <SidebarProvider>
                <BrowserRouter>
                    <AuthenticatedApp />
                </BrowserRouter>
            </SidebarProvider>
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
        case '/access-codes':
            return <AccessCodes />;
        case '/chat':
            return <Chat />;
        default:
            return <Navigate to="/" />;
    }
};

export default App;
