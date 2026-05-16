import React from 'react';

import { useVoiceAgentFormStore } from '@/stores/forms/voiceAgentFormStore';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';

import { VoiceProvider } from '@/types/voiceAgent';

interface AIConfigSectionProps {
  viewOnly?: boolean;
}

export const AIConfigSection: React.FC<AIConfigSectionProps> = ({ viewOnly = false }) => {
  const {
    systemPrompt,
    firstMessage,
    voiceProvider,
    language,
    temperature,
    maxDurationSeconds,
    errors,
    touched,
    updateField,
    updateNumericField,
    setFieldTouched,
  } = useVoiceAgentFormStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="systemPrompt">System Prompt *</Label>
          <Textarea
            id="systemPrompt"
            value={systemPrompt}
            onChange={e => updateField('systemPrompt', e.target.value)}
            onBlur={() => setFieldTouched('systemPrompt', true)}
            disabled={viewOnly}
            placeholder="You are an examiner conducting an oral exam on philosophy. Ask questions about the student's understanding of key concepts..."
            rows={6}
            className="font-mono text-sm"
            aria-invalid={touched.systemPrompt && !!errors.systemPrompt}
          />
          {touched.systemPrompt && errors.systemPrompt && (
            <p className="text-destructive text-sm">{errors.systemPrompt}</p>
          )}
          <p className="text-muted-foreground text-xs">
            Instructions for the AI agent's behavior and exam content
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstMessage">First Message</Label>
          <Textarea
            id="firstMessage"
            value={firstMessage}
            onChange={e => updateField('firstMessage', e.target.value)}
            disabled={viewOnly}
            placeholder="Hello! I'll be conducting your exam today. Are you ready to begin?"
            rows={2}
          />
          <p className="text-muted-foreground text-xs">
            The agent's opening message when the exam starts
          </p>
        </div>

        {voiceProvider === VoiceProvider.MistralVoice && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={language}
                onValueChange={value => updateField('language', value)}
                disabled={viewOnly}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                  <SelectItem value="nl">Dutch</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Temperature</Label>
              <span className="text-muted-foreground text-sm">{temperature}</span>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={([value]) => updateNumericField('temperature', value)}
              min={0}
              max={2}
              step={0.1}
              disabled={viewOnly}
            />
            <p className="text-muted-foreground text-xs">
              Lower = more focused, Higher = more creative
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxDurationSeconds">Max Duration (seconds)</Label>
            <Input
              id="maxDurationSeconds"
              type="number"
              value={maxDurationSeconds}
              onChange={e =>
                updateNumericField('maxDurationSeconds', parseInt(e.target.value) || 1800)
              }
              disabled={viewOnly}
              min={60}
              max={7200}
            />
            <p className="text-muted-foreground text-xs">
              {Math.floor(maxDurationSeconds / 60)} minutes
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIConfigSection;
