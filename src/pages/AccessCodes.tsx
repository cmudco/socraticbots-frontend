// src/pages/AccessCodes.tsx
import React, { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Key } from 'lucide-react';

import { accessCodeService } from '@/services/accessCodes.service';

interface ApiError {
  response?: {
    data?: {
      access_code?: string[];
      error?: string;
    };
  };
}

const AccessCodes: React.FC = () => {
  const [accessCode, setAccessCode] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();

  const redeemMutation = useMutation({
    mutationFn: (code: string) => accessCodeService.redeemAccessCode(code),
    onSuccess: data => {
      setMessage(data.message);
      setIsSuccess(true);
      setAccessCode('');
      // Invalidate books query to refresh the user's available books
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error.response?.data?.access_code?.[0] ||
        error.response?.data?.error ||
        'Failed to redeem access code';
      setMessage(errorMessage);
      setIsSuccess(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode.trim()) {
      redeemMutation.mutate(accessCode.trim());
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <Key className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Access Codes</h1>
        </div>

        <p className="mb-6 text-gray-600">
          Enter an access code from your instructor to gain access to additional books and chapters.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="accessCode" className="mb-2 block text-sm font-medium text-gray-700">
              Access Code
            </label>
            <input
              type="text"
              id="accessCode"
              value={accessCode}
              onChange={e => setAccessCode(e.target.value)}
              placeholder="Enter your access code (e.g., SB-ABC123XY)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={redeemMutation.isPending}
            />
          </div>

          <button
            type="submit"
            disabled={!accessCode.trim() || redeemMutation.isPending}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {redeemMutation.isPending ? 'Redeeming...' : 'Redeem Access Code'}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 rounded-md p-4 ${
              isSuccess
                ? 'border border-green-200 bg-green-50 text-green-800'
                : 'border border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-6 rounded-md bg-gray-50 p-4">
          <h3 className="mb-2 font-semibold text-gray-900">How to use access codes:</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Get access codes from your instructors</li>
            <li>• Each code gives you access to specific books or chapters</li>
            <li>• You can redeem multiple codes to access content from different courses</li>
            <li>• Access codes can only be used once per student</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AccessCodes;
