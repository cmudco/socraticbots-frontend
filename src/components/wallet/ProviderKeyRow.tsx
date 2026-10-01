import { useState } from 'react';

import { useDeleteProviderKey, useSaveProviderKey } from '@/hooks/queries/useWallet';

import { useToastStore } from '@/stores/ui/toastStore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { ProviderKeyProvider } from '@/types/wallet';

interface ProviderKeyRowProps {
  provider: ProviderKeyProvider;
  label: string;
  maskedKey: string | null;
}

/** One provider in the BYO dialog: its masked key, and save or remove. */
export const ProviderKeyRow = ({ provider, label, maskedKey }: ProviderKeyRowProps) => {
  const { addToast } = useToastStore();
  const save = useSaveProviderKey();
  const remove = useDeleteProviderKey();
  const [draft, setDraft] = useState('');

  const onError = (error: Error) => addToast({ type: 'error', message: error.message });

  return (
    <div className="border-border space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground font-mono text-xs">{maskedKey ?? 'No key'}</span>
      </div>
      <div className="flex gap-2">
        <Input
          type="password"
          autoComplete="new-password"
          placeholder={maskedKey ? 'Replace key' : 'Paste API key'}
          value={draft}
          onChange={event => setDraft(event.target.value)}
        />
        <Button
          size="sm"
          disabled={!draft.trim() || save.isPending}
          onClick={() =>
            save.mutate(
              { provider, apiKey: draft.trim() },
              {
                onSuccess: () => {
                  setDraft('');
                  addToast({ type: 'success', message: `${label} key saved.` });
                },
                onError,
              }
            )
          }
        >
          Save
        </Button>
        {maskedKey && (
          <Button
            size="sm"
            variant="outline"
            disabled={remove.isPending}
            onClick={() => remove.mutate(provider, { onError })}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};
