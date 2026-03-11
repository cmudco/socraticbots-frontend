import React, { useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, Key } from 'lucide-react';

import { accessCodeService } from '@/services/accessCodes.service';

import { formatDate } from '@/utils/formatters';

const AccessCodes: React.FC = () => {
  const [accessCode, setAccessCode] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: myAccessCodes,
    isLoading: isLoadingCodes,
    error: codesError,
  } = useQuery({
    queryKey: ['my-access-codes'],
    queryFn: () => accessCodeService.getMyAccessCodes(),
    staleTime: 5 * 60 * 1000,
  });

  const redeemMutation = useMutation({
    mutationFn: (code: string) => accessCodeService.redeemAccessCode(code),
    onSuccess: data => {
      setMessage(data.message);
      setIsSuccess(true);
      setAccessCode('');
      queryClient.invalidateQueries({ queryKey: ['bot-groups'] });
      queryClient.invalidateQueries({ queryKey: ['my-access-codes'] });
    },
    onError: (error: unknown) => {
      setMessage(error instanceof Error ? error.message : 'Failed to redeem subscription code');
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="border-border bg-background rounded-lg border p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <Key className="text-primary h-6 w-6" />
          <h1 className="text-foreground text-2xl font-bold">Subscription Codes</h1>
        </div>

        <p className="text-muted-foreground mb-6">
          Enter a subscription code to gain access to additional chatbot groups and bots.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="accessCode" className="text-foreground mb-2 block text-sm font-medium">
              Subscription Code
            </label>
            <input
              type="text"
              id="accessCode"
              value={accessCode}
              onChange={e => setAccessCode(e.target.value)}
              placeholder="Enter your subscription code (e.g., SB-ABC123XY)"
              className="border-input focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
              disabled={redeemMutation.isPending}
            />
          </div>

          <button
            type="submit"
            disabled={!accessCode.trim() || redeemMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/80 disabled:bg-muted w-full rounded-md px-4 py-2 transition-colors disabled:cursor-not-allowed"
          >
            {redeemMutation.isPending ? 'Redeeming...' : 'Redeem Subscription Code'}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 rounded-md p-4 ${
              isSuccess
                ? 'border border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {message}
          </div>
        )}

        <div className="bg-muted/50 mt-6 rounded-md p-4">
          <h3 className="text-foreground mb-2 font-semibold">How to use subscription codes:</h3>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>• Get subscription codes from your instructors</li>
            <li>• Each code gives you access to specific chatbot groups or bots</li>
            <li>• You can redeem multiple codes to access content from different courses</li>
            <li>• Subscription codes can only be used once per student</li>
          </ul>
        </div>
      </div>

      <div className="border-border bg-background rounded-lg border p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          <h2 className="text-foreground text-xl font-bold">My Redeemed Subscription Codes</h2>
        </div>

        {isLoadingCodes ? (
          <div className="py-4 text-center">
            <div className="border-primary inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-r-transparent"></div>
            <p className="text-muted-foreground mt-2">Loading your subscription codes...</p>
          </div>
        ) : codesError ? (
          <div className="py-4 text-center">
            <p className="text-destructive">
              Error loading subscription codes: {codesError?.message || 'Unknown error'}
            </p>
          </div>
        ) : myAccessCodes &&
          myAccessCodes.redeemedCodes &&
          myAccessCodes.redeemedCodes.length > 0 ? (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              You have redeemed {myAccessCodes?.totalCount || 0} subscription code
              {(myAccessCodes?.totalCount || 0) !== 1 ? 's' : ''}.
            </p>

            <div className="space-y-3">
              {myAccessCodes.redeemedCodes?.map((code, index) => (
                <div
                  key={index}
                  className="border-border bg-muted/50 flex items-center justify-between rounded-md border p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground rounded px-2 py-1 font-mono text-sm">
                        {code.code}
                      </span>
                      <span className="text-muted-foreground text-sm capitalize">
                        {code.targetType}
                      </span>
                    </div>
                    <p className="text-foreground mt-1 font-medium">{code.targetName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground flex items-center gap-1 text-sm">
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
            <Key className="text-muted-foreground mx-auto h-12 w-12" />
            <p className="text-muted-foreground mt-2">No subscription codes redeemed yet.</p>
            <p className="text-muted-foreground/70 text-sm">
              Use the form above to redeem subscription codes from your instructors.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessCodes;
