// src/App.tsx
import { RootLayout } from './layouts/RootLayout'
import { Home } from './pages/Home'
import './App.css'  
function App() {
  return (
    <RootLayout>
      <Home />
    </RootLayout>
  )
}

export default App