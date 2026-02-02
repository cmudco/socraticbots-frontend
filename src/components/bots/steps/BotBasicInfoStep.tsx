import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import type { BotFormData } from '@/schemas/botFormSchema';

import { useDareLLMModels } from '@/hooks/queries/useDareLLMModels';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface BotBasicInfoStepProps {
  isEdit?: boolean;
}

const BotBasicInfoStep: React.FC<BotBasicInfoStepProps> = ({ isEdit = false }) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<BotFormData>();

  const { data: dareLLMModels, isLoading: modelsLoading } = useDareLLMModels();

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

      {/* Chat Model Selection - Only when editing */}
      {isEdit && (
        <div className="space-y-2">
          <Label htmlFor="chatModelDareId">Agent *</Label>
          {modelsLoading || !dareLLMModels ? (
            <div className="border-input bg-muted/50 text-muted-foreground flex h-10 w-full items-center rounded-md border px-3 text-sm">
              Loading models...
            </div>
          ) : (
            <Controller
              name="chatModelDareId"
              control={control}
              render={({ field }) => {
                const stringValue =
                  field.value !== null && field.value !== undefined ? String(field.value) : '';

                return (
                  <Select
                    value={stringValue}
                    onValueChange={value => {
                      // Reject empty values - Agent is required, never clear it
                      // Radix Select fires empty onValueChange on remount, we must ignore it
                      if (!value) return;
                      field.onChange(parseInt(value, 10));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {dareLLMModels.map(model => (
                        <SelectItem key={model.id} value={String(model.id)}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
          )}
        </div>
      )}

      {/* Tracking Model Selection - Only when editing */}
      {isEdit && (
        <div className="space-y-2">
          <Label htmlFor="trackingModelDareId">Progress Tracker</Label>
          <p className="text-muted-foreground text-xs">
            Optional: Enable to track student progress
          </p>
          {modelsLoading || !dareLLMModels ? (
            <div className="border-input bg-muted/50 text-muted-foreground flex h-10 w-full items-center rounded-md border px-3 text-sm">
              Loading models...
            </div>
          ) : (
            <Controller
              name="trackingModelDareId"
              control={control}
              render={({ field }) => {
                // Handle null value as 'none' for the Select
                const stringValue =
                  field.value !== null && field.value !== undefined && !Number.isNaN(field.value)
                    ? String(field.value)
                    : 'none';

                return (
                  <Select
                    value={stringValue}
                    onValueChange={value => {
                      // Reject empty values - Radix fires empty on remount
                      if (!value) return;
                      if (value === 'none') {
                        field.onChange(null);
                      } else {
                        const parsed = parseInt(value, 10);
                        if (!Number.isNaN(parsed)) {
                          field.onChange(parsed);
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="None (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {dareLLMModels.map(model => (
                        <SelectItem key={model.id} value={String(model.id)}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
          )}
        </div>
      )}

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
      </div>
    </div>
  );
};

export default BotBasicInfoStep;
