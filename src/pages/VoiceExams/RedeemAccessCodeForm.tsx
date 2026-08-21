/**
 * Reusable access code redemption form.
 * Used in both the agent grid card and the empty-state view.
 */
import React, { useState } from 'react';

import { useRedeemVoiceAccessCode } from '@/hooks/queries/useVoiceAgents';

interface RedeemAccessCodeFormProps {
  title: string;
  description: string;
  className?: string;
}

const RedeemAccessCodeForm: React.FC<RedeemAccessCodeFormProps> = ({
  title,
  description,
  className,
}) => {
  const redeemCode = useRedeemVoiceAccessCode();
  const [accessCode, setAccessCode] = useState('');
  const [redeemError, setRedeemError] = useState('');

  const handleRedeemCode = async () => {
    if (!accessCode.trim()) return;
    setRedeemError('');
    try {
      await redeemCode.mutateAsync(accessCode.trim());
      setAccessCode('');
    } catch {
      setRedeemError('Invalid access code. Please try again.');
    }
  };

  return (
    <div className={className}>
      <h3 className="text-foreground mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mb-4 text-sm">{description}</p>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={accessCode}
          onChange={e => {
            setAccessCode(e.target.value);
            setRedeemError('');
          }}
          onKeyDown={e => e.key === 'Enter' && handleRedeemCode()}
          placeholder="Enter access code"
          className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border px-4 py-2 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        {redeemError && <p className="text-center text-sm text-red-500">{redeemError}</p>}
        <button
          onClick={handleRedeemCode}
          disabled={redeemCode.isPending || !accessCode.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-2 disabled:opacity-50"
        >
          {redeemCode.isPending ? 'Unlocking...' : 'Unlock Assignment'}
        </button>
      </div>
    </div>
  );
};

export default RedeemAccessCodeForm;
