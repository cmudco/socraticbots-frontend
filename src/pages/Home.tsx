import React from 'react';

import AuthTest from '@/components/common/AuthTest';

const Home: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold">Home Page</h1>
      <div>
        <h1>Home Page</h1>
        <AuthTest />
      </div>
    </div>
  );
};

export default Home;
