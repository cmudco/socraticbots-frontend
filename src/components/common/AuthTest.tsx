// src/components/common/AuthTest.tsx
import React, { useState } from 'react';
import { baseRequest } from '../../utils/baseRequest';
import { METHOD } from '../../constants/requests';

const AuthTest: React.FC = () => {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const testAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      // This will use baseRequest with auth token handling
      const result = await baseRequest({
        url: 'users/me/',
        method: METHOD.GET,
      });
      setResponse(JSON.stringify(result, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Auth test failed:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-4">API Auth Test</h2>
      
      <button 
        onClick={testAuth}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
      >
        {loading ? 'Testing...' : 'Test Auth'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {response && (
        <div className="mt-4">
          <h3 className="font-semibold">Response:</h3>
          <pre className="p-3 bg-gray-100 rounded overflow-auto max-h-60">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AuthTest;
