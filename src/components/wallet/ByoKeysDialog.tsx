import { useState } from 'react';

import { Loader2 } from 'lucide-react';

import {
  useDeleteProviderKey,
  useProviderKeyStatus,
  useSaveProviderKey,
} from '@/hooks/queries/useWallet';

import { useToastStore } from '@/stores/ui/toastStore';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import type { ProviderKeyProvider } from '@/types/wallet';

const PROVIDERS: { provider: ProviderKeyProvider; label: string }[] = [
  { provider: 'openai', label: 'OpenAI' },
  { provider: 'claude', label: 'Anthropic Claude' },
  { provider: 'gemini', label: 'Google Gemini' },
];

interface ByoKeysDialogProps {
  open: boolean;
  onClose: () => void;
}

/** Same provider-key list DARE's BYO dialog shows, one row per provider. */
export const ByoKeysDialog = ({ open, onClose }: ByoKeysDialogProps) => {
  const { data: status, isLoading } = useProviderKeyStatus(open);

  return (
    <Dialog open={open} onOpenChange={next => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Your provider keys</DialogTitle>
          <DialogDescription>
            Calls to a provider you have a key for are billed to that provider account, not your
            DARE wallet.
          </DialogDescription>
        </DialogHeader>
        {isLoading || !status ? (
          <div className="flex justify-center p-6">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {PROVIDERS.map(({ provider, label }) => (
              <ProviderKeyRow
                key={provider}
                provider={provider}
                label={label}
                maskedKey={status[provider]?.hasKey ? status[provider].maskedKey : null}
              />
            ))}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface ProviderKeyRowProps {
  provider: ProviderKeyProvider;
  label: string;
  maskedKey: string | null;
}

const ProviderKeyRow = ({ provider, label, maskedKey }: ProviderKeyRowProps) => {
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
