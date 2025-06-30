// src/components/common/AuthTest.tsx
import React, { useState } from 'react';

import { METHOD } from '../../constants/requests';
import { baseRequest } from '../../utils/baseRequest';

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
    <div className="rounded border p-4">
      <h2 className="mb-4 text-lg font-bold">API Auth Test</h2>

      <button
        onClick={testAuth}
        disabled={loading}
        className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-blue-300"
      >
        {loading ? 'Testing...' : 'Test Auth'}
      </button>

      {error && <div className="mt-4 rounded bg-red-100 p-3 text-red-700">Error: {error}</div>}

      {response && (
        <div className="mt-4">
          <h3 className="font-semibold">Response:</h3>
          <pre className="max-h-60 overflow-auto rounded bg-gray-100 p-3">{response}</pre>
        </div>
      )}
    </div>
  );
};

export default AuthTest;
