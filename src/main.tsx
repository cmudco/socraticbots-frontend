import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './index.css';
import { ReactQueryProvider } from './providers/ReactQueryProvider';

createRoot(document.getElementById('root')!).render(
  <ReactQueryProvider>
    <App />
  </ReactQueryProvider>
);
