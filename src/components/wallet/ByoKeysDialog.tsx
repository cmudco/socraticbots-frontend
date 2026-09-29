import { Loader2 } from 'lucide-react';

import { useProviderKeyStatus } from '@/hooks/queries/useWallet';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { ProviderKeyProvider } from '@/types/wallet';

import { ProviderKeyRow } from './ProviderKeyRow';

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
