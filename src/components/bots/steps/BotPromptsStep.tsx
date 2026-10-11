import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import type { BotFormData } from '@/schemas/botFormSchema';

import HistoryWindowSlider from '@/components/bots/HistoryWindowSlider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const BotPromptsStep: React.FC = () => {
  const { register, control, watch } = useFormContext<BotFormData>();

  const [trackingModel, learningGoals, trackingPrompt] = watch([
    'trackingModelDareId',
    'learningGoals',
    'trackingPrompt',
  ]);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="space-y-2">
        <Label htmlFor="greeting">Greeting Message</Label>
        <p className="text-muted-foreground text-xs">
          The initial message shown when a user starts a chat
        </p>
        <Textarea
          id="greeting"
          {...register('greeting')}
          placeholder="Hello! How can I help you today?"
          rows={3}
        />
      </div>

      {/* Chat Prompt */}
      <div className="space-y-2">
        <Label htmlFor="chatPrompt">Chat System Prompt</Label>
        <p className="text-muted-foreground text-xs">
          Instructions that define how the bot responds to users
        </p>
        <Textarea
          id="chatPrompt"
          {...register('chatPrompt')}
          placeholder="You are a helpful AI tutor..."
          rows={5}
        />
      </div>

      <Controller
        name="chatHistoryLimit"
        control={control}
        render={({ field }) => (
          <HistoryWindowSlider
            id="chatHistoryLimit"
            label="Chat History"
            description="How much of the conversation the bot rereads before each reply. Shorter windows cost less on long chats but forget earlier answers."
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      {trackingModel && (!learningGoals?.trim() || !trackingPrompt?.trim()) && (
        <p role="status" className="bg-muted text-muted-foreground rounded-lg p-3 text-sm">
          Progress tracking is paused until both a tracking prompt and learning goals are provided.
          Chat will still work.
        </p>
      )}

      {/* Tracking Prompt */}
      <div className="space-y-2">
        <Label htmlFor="trackingPrompt">Tracking Prompt</Label>
        <p className="text-muted-foreground text-xs">
          Instructions for the progress tracking model (if enabled)
        </p>
        <Textarea
          id="trackingPrompt"
          {...register('trackingPrompt')}
          placeholder="Analyze the student's understanding..."
          rows={4}
        />
      </div>

      <Controller
        name="trackingHistoryLimit"
        control={control}
        render={({ field }) => (
          <HistoryWindowSlider
            id="trackingHistoryLimit"
            label="Tracker History"
            description="How much of the conversation the progress tracker reads when it assesses the student."
            value={field.value}
            onChange={field.onChange}
            disabled={!trackingModel}
          />
        )}
      />

      {/* Learning Goals */}
      <div className="space-y-2">
        <Label htmlFor="learningGoals">Learning Goals</Label>
        <p className="text-muted-foreground text-xs">Define the learning objectives for this bot</p>
        <Textarea
          id="learningGoals"
          {...register('learningGoals')}
          placeholder="1. Understand basic concepts...&#10;2. Apply knowledge to problems..."
          rows={4}
        />
      </div>

      {/* Advanced Prompt */}
      <Controller
        name="isAdvanced"
        control={control}
        render={({ field }) => (
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <Label htmlFor="isAdvanced">Advanced Prompt</Label>
              <p className="text-muted-foreground text-xs">
                Uses an expanded system prompt that includes conversation history, subject/topic,
                learning goals, and relevant content for deeper responses
              </p>
            </div>
            <Switch id="isAdvanced" checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />
    </div>
  );
};

export default BotPromptsStep;
