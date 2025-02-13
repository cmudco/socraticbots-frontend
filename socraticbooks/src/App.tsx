import { useState } from 'react';
import Header from './components/common/Header';
import Sidebar from './components/sidebar/Sidebar';
import { ScreenType } from './types/navigation';
import Home from './components/screens/Home';
import Login from './components/screens/Login';
import { useAuthContext } from './contexts/AuthContext';

function App() {
    const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
    const user = useAuthContext();

    // If no user is logged in, show login screen
    if (!user) {
        return <Login />;
    }

    const renderScreen = () => {
        switch (currentScreen) {
            case 'home':
                return <Home />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <Sidebar currentScreen={currentScreen} onNavigate={setCurrentScreen} />
            
            <main className="ml-64 pt-14"> 
                <div className="p-4"> 
                    {renderScreen()}
                </div>
            </main>
        </div>
    );
}

export default App;
