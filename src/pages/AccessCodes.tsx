import React, { useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, Key } from 'lucide-react';

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

  const { data: studentAccessCodes, isLoading: isLoadingCodes, error: codesError } = useQuery({
    queryKey: ['student-access-codes'],
    queryFn: () => accessCodeService.getStudentAccessCodes(),
    staleTime: 5 * 60 * 1000,
  });


  const redeemMutation = useMutation({
    mutationFn: (code: string) => accessCodeService.redeemAccessCode(code),
    onSuccess: data => {
      setMessage(data.message);
      setIsSuccess(true);
      setAccessCode('');
      queryClient.invalidateQueries({ queryKey: ['bot-groups'] });
      queryClient.invalidateQueries({ queryKey: ['student-access-codes'] });
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <Key className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Access Codes</h1>
        </div>

        <p className="mb-6 text-gray-600">
          Enter an access code from your instructor to gain access to additional chatbot groups and
          bots.
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
            <li>• Each code gives you access to specific chatbot groups or bots</li>
            <li>• You can redeem multiple codes to access content from different courses</li>
            <li>• Access codes can only be used once per student</li>
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">My Redeemed Access Codes</h2>
        </div>

        {isLoadingCodes ? (
          <div className="py-4 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading your access codes...</p>
          </div>
        ) : codesError ? (
          <div className="py-4 text-center">
            <p className="text-red-600">Error loading access codes: {codesError?.message || 'Unknown error'}</p>
          </div>
        ) : studentAccessCodes && studentAccessCodes.redeemedCodes && studentAccessCodes.redeemedCodes.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You have redeemed {studentAccessCodes?.totalCount || 0} access code
              {(studentAccessCodes?.totalCount || 0) !== 1 ? 's' : ''}.
            </p>

            <div className="space-y-3">
              {studentAccessCodes.redeemedCodes?.map((code, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-blue-100 px-2 py-1 font-mono text-sm text-blue-800">
                        {code.code}
                      </span>
                      <span className="text-sm text-gray-500 capitalize">{code.targetType}</span>
                    </div>
                    <p className="mt-1 font-medium text-gray-900">{code.targetName}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>Redeemed {formatDate(code.redeemedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <Key className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-600">No access codes redeemed yet.</p>
            <p className="text-sm text-gray-500">
              Use the form above to redeem access codes from your instructors.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessCodes;
