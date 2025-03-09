// App.tsx
import React from 'react';
import Layout from './components/layout/Layout';

const App: React.FC = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-bold text-blue-600">Hello, World!</h1>
    </Layout>
  );
}

export default App;