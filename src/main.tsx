import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './index.css';
import { Sentry, initSentry } from './lib/sentry';
import { ReactQueryProvider } from './providers/ReactQueryProvider';

initSentry();

createRoot(document.getElementById('root')!).render(
  <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
    <ReactQueryProvider>
      <App />
    </ReactQueryProvider>
  </Sentry.ErrorBoundary>
);
