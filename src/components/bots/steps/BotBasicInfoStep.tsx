import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { BotModelPaidBy, WalletEmptyReason } from '@/constants/wallet';
import type { BotFormData } from '@/schemas/botFormSchema';

import { useWalletScopedDareLLMModels } from '@/hooks/queries/useDareLLMModels';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface BotBasicInfoStepProps {
  botId?: number;
}

const BotBasicInfoStep: React.FC<BotBasicInfoStepProps> = ({ botId }) => {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<BotFormData>();
  const selectedChatModel = watch('chatModelDareId');

  const walletScope = botId ? `bot:${botId}` : 'bot:new';
  const { data: walletScoped, isLoading: modelsLoading } =
    useWalletScopedDareLLMModels(walletScope);

  const dareLLMModels = walletScoped?.models ?? [];
  const wallet = walletScoped?.wallet;
  const chatterPaid = dareLLMModels.filter(model => model.paidBy !== BotModelPaidBy.OWNER);
  const ownerPaid = dareLLMModels.filter(model => model.paidBy === BotModelPaidBy.OWNER);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Bot Title *</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Enter bot title"
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="subject">Subject *</Label>
        <Input
          id="subject"
          {...register('subject')}
          placeholder="e.g., Mathematics, Science, History"
          className={errors.subject ? 'border-destructive' : ''}
        />
        {errors.subject && <p className="text-destructive text-sm">{errors.subject.message}</p>}
      </div>

      {/* Topic */}
      <div className="space-y-2">
        <Label htmlFor="topic">Topic *</Label>
        <Input
          id="topic"
          {...register('topic')}
          placeholder="e.g., Algebra, Chemistry, World War II"
          className={errors.topic ? 'border-destructive' : ''}
        />
        {errors.topic && <p className="text-destructive text-sm">{errors.topic.message}</p>}
      </div>

      {/* Chat Model Selection */}
      <div className="space-y-2">
        <Label htmlFor="chatModelDareId">Agent *</Label>
        {wallet?.isEmpty ? (
          <div className="border-input bg-muted/30 text-muted-foreground flex flex-col gap-1 rounded-md border px-3 py-3 text-sm">
            <span className="font-medium">
              {wallet.emptyReason === WalletEmptyReason.NO_KEYS &&
                'No keys configured for this bot’s billing source.'}
              {wallet.emptyReason === WalletEmptyReason.PROBE_FAILED &&
                'Could not reach the configured LiteLLM proxy.'}
              {wallet.emptyReason === WalletEmptyReason.TARGET_KEY_DELETED &&
                'The LiteLLM key targeted by this bot was removed.'}
            </span>
            <span className="text-xs">
              Switch your wallet or check the key from the wallet menu to load models.
            </span>
          </div>
        ) : modelsLoading || !dareLLMModels ? (
          <div className="border-input bg-muted/50 text-muted-foreground flex h-10 w-full items-center rounded-md border px-3 text-sm">
            Loading models...
          </div>
        ) : (
          <Controller
            name="chatModelDareId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ''}
                onValueChange={value => {
                  // Picker ids are opaque ("42" or "litellm:<key>:<name>") —
                  // store verbatim, don't parse. Radix fires an empty
                  // onValueChange on remount; ignore so we don't wipe the
                  // selected agent.
                  if (!value) return;
                  field.onChange(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>DARE models · each student pays</SelectLabel>
                    {chatterPaid.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  {ownerPaid.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Your LiteLLM models · you pay</SelectLabel>
                      {ownerPaid.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                          <span className="text-muted-foreground ml-2 text-xs">
                            via {model.sponsorKeyLabel}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            )}
          />
        )}
        {botId &&
          selectedChatModel &&
          !modelsLoading &&
          !dareLLMModels.some(model => model.id === selectedChatModel) && (
            <p className="text-destructive text-xs">
              The model this bot was saved with is no longer available to you. Pick another model.
            </p>
          )}
        {ownerPaid.some(model => model.id === selectedChatModel) && (
          <p className="text-muted-foreground text-xs">
            Students chat on your LiteLLM key; their wallets aren&apos;t charged. You can see what
            this bot costs you under Usage.
          </p>
        )}
      </div>

      {/* Tracking Model Selection */}
      <div className="space-y-2">
        <Label htmlFor="trackingModelDareId">Progress Tracker</Label>
        <p className="text-muted-foreground text-xs">
          {modelsLoading || chatterPaid.length
            ? 'Optional: Enable to track student progress'
            : 'Progress tracking runs on a DARE model. Switch to your DARE or BYO wallet to choose one.'}
        </p>
        {modelsLoading || !dareLLMModels ? (
          <div className="border-input bg-muted/50 text-muted-foreground flex h-10 w-full items-center rounded-md border px-3 text-sm">
            Loading models...
          </div>
        ) : (
          <Controller
            name="trackingModelDareId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? 'none'}
                onValueChange={value => {
                  // Radix fires empty onValueChange on remount; ignore.
                  if (!value) return;
                  // Picker ids are opaque — store verbatim, no parsing.
                  field.onChange(value === 'none' ? null : value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="None (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {chatterPaid.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </div>

      {/* Bot Status Toggle */}
      <div className="space-y-4 border-t pt-4">
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isActive">Bot Status</Label>
                <p className="text-muted-foreground text-xs">
                  {field.value ? 'Bot is active' : 'Bot is hidden from users'}
                </p>
              </div>
              <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />

        {/* Web Search Toggle */}
        <Controller
          name="webSearchEnabled"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="webSearchEnabled">Web Search</Label>
                <p className="text-muted-foreground text-xs">
                  Enable real-time web search for up-to-date information
                </p>
              </div>
              <Switch
                id="webSearchEnabled"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </div>
          )}
        />

        {/* Document Retrieval Mode (mirrors DARE's RAG modes) */}
        <Controller
          name="ragMode"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="ragMode">Document Retrieval</Label>
                <p className="text-muted-foreground text-xs">
                  {field.value === 'agentic'
                    ? 'Autonomous — searches documents in multiple steps. Public chats use Advanced retrieval.'
                    : field.value === 'naive'
                      ? 'Fast — direct vector lookup pre-loaded each turn'
                      : 'Thorough — analyzed and reranked context pre-loaded each turn'}
                </p>
              </div>
              <Select
                value={field.value}
                onValueChange={value => {
                  if (value) field.onChange(value);
                }}
              >
                <SelectTrigger id="ragMode" className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="naive">Classic (Fast)</SelectItem>
                  <SelectItem value="advanced">Advanced (Thorough)</SelectItem>
                  <SelectItem value="agentic">Agentic (Autonomous)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default BotBasicInfoStep;
