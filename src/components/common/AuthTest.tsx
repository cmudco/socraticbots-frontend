// src/components/common/AuthTest.tsx
import React, { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';

import { useErrorStore } from '@/stores/ui/errorStore';

const AuthTest: React.FC = () => {
  const { tokens } = useAuth();
  const { addError, clearErrorsByContext, getErrorsByContext } = useErrorStore();

  // Keep local state for temporary test data
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleTestAuth = async () => {
    setLoading(true);
    setResponse('');
    clearErrorsByContext('authTest');

    try {
      const response = await fetch('/api/auth/test', {
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
        },
      });

      if (response.ok) {
        const data = await response.text();
        setResponse(data);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      addError(errorMessage, 'error', 'authTest');
      console.error('Auth test error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get errors for this context
  const contextErrors = getErrorsByContext('authTest');

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Auth Test</h2>

      <div className="mb-4">
        <button
          onClick={handleTestAuth}
          disabled={loading}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Testing...' : 'Test Auth'}
        </button>
      </div>

      {contextErrors.length > 0 && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <h4 className="font-medium">Error</h4>
          <p>{contextErrors[0].message}</p>
        </div>
      )}

      {response && (
        <div className="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
          <h4 className="font-medium">Response</h4>
          <pre className="mt-2 text-sm">{response}</pre>
        </div>
      )}

      <div className="mt-4">
        <h3 className="mb-2 font-semibold">Current Auth State:</h3>
        <pre className="text-sm">{JSON.stringify(tokens, null, 2)}</pre>
      </div>
    </div>
  );
};

export default AuthTest;
