import { useState } from 'react';

import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

import { useCreateLiteLLMKey } from '@/hooks/queries/useWallet';

import { useToastStore } from '@/stores/ui/toastStore';

import { walletService } from '@/services/wallet.service';

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
import { Label } from '@/components/ui/label';

interface AddLiteLLMKeyDialogProps {
  open: boolean;
  onClose: () => void;
}

type Found = { models: string[]; recommendedModels: string[] };

const EMPTY = { label: '', baseUrl: '', apiKey: '' };

/**
 * Two steps, as in DARE: the connection is tested before anything is saved,
 * then the background model is picked from what the gateway actually lists.
 */
export const AddLiteLLMKeyDialog = ({ open, onClose }: AddLiteLLMKeyDialogProps) => {
  const { addToast } = useToastStore();
  const createKey = useCreateLiteLLMKey();
  const [values, setValues] = useState(EMPTY);
  const [found, setFound] = useState<Found | null>(null);
  const [backgroundModel, setBackgroundModel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const close = () => {
    setValues(EMPTY);
    setFound(null);
    setBackgroundModel('');
    setError(null);
    onClose();
  };

  const complete = values.label.trim() && values.baseUrl.trim() && values.apiKey.trim();

  const testConnection = async () => {
    setTesting(true);
    setError(null);
    try {
      const result = await walletService.testLiteLLMConnection(
        values.baseUrl.trim(),
        values.apiKey.trim()
      );
      if (!result.ok) {
        setError(result.error || 'Connection failed — check the URL and key.');
        return;
      }
      setFound({ models: result.models, recommendedModels: result.recommendedModels });
      setBackgroundModel(result.recommendedModels[0] ?? '');
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setTesting(false);
    }
  };

  const save = () =>
    createKey.mutate(
      {
        label: values.label.trim(),
        baseUrl: values.baseUrl.trim(),
        apiKey: values.apiKey.trim(),
        backgroundModel,
      },
      {
        onSuccess: () => {
          addToast({ type: 'success', message: 'LiteLLM key added.' });
          close();
        },
        onError: saveError => setError(saveError.message),
      }
    );

  const field = (name: keyof typeof EMPTY) => ({
    value: values[name],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      setValues(current => ({ ...current, [name]: event.target.value })),
  });

  return (
    <Dialog open={open} onOpenChange={next => !next && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{found ? 'Choose a background model' : 'Add LiteLLM key'}</DialogTitle>
          <DialogDescription>
            {found
              ? 'Used for titles and summaries. You can change it later in DARE.'
              : 'Route calls through your LiteLLM gateway. Include /v1 in the base URL. The key is encrypted and never shown again.'}
          </DialogDescription>
        </DialogHeader>

        {!found ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="litellm-label">Label</Label>
              <Input id="litellm-label" placeholder="Personal, PHIL 101, …" {...field('label')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="litellm-url">Base URL</Label>
              <Input
                id="litellm-url"
                type="url"
                placeholder="https://gateway.example.com/v1"
                {...field('baseUrl')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="litellm-key">API key</Label>
              <Input
                id="litellm-key"
                type="password"
                autoComplete="new-password"
                placeholder="sk-…"
                {...field('apiKey')}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-primary inline-flex items-center gap-1.5 text-xs font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Connected — {found.models.length} models available
            </p>
            <select
              aria-label="Background model"
              value={backgroundModel}
              onChange={event => setBackgroundModel(event.target.value)}
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
            >
              <option value="">Use the DARE default</option>
              {found.models.map(model => (
                <option key={model} value={model}>
                  {model}
                  {found.recommendedModels.includes(model) ? ' — Recommended' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-2 text-xs break-words">
            {error}
          </p>
        )}

        <DialogFooter>
          {!found ? (
            <>
              <Button variant="outline" onClick={close} disabled={testing}>
                Cancel
              </Button>
              <Button onClick={testConnection} disabled={!complete || testing}>
                {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {testing ? 'Testing connection…' : 'Next'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setFound(null)}
                disabled={createKey.isPending}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={save} disabled={createKey.isPending}>
                {createKey.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
