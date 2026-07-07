import React from 'react';

import { useVoiceAgentFormStore } from '@/stores/forms/voiceAgentFormStore';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

import { VoiceEagerness, VoiceProvider } from '@/types/voiceAgent';

interface MistralAdvancedSectionProps {
  viewOnly?: boolean;
}

/**
 * Mistral runtime timing controls. Examiner audio for the production path is
 * controlled by the runtime TTS env, so per-agent Mistral voice selection is
 * intentionally not shown here.
 */
export const MistralAdvancedSection: React.FC<MistralAdvancedSectionProps> = ({
  viewOnly = false,
}) => {
  const { voiceProvider, voiceEagerness, voiceTurnTimeoutSecs, updateField, updateNumericField } =
    useVoiceAgentFormStore();

  const isMistral = voiceProvider === VoiceProvider.MistralVoice;

  if (!isMistral) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mistral Runtime Settings</CardTitle>
        <CardDescription>
          Response speed and silence handling for the realtime voice agent.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Eagerness</Label>
          <Select
            value={voiceEagerness}
            onValueChange={value => updateField('voiceEagerness', value as VoiceEagerness)}
            disabled={viewOnly}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={VoiceEagerness.Low}>
                Low — patient (waits longer before responding)
              </SelectItem>
              <SelectItem value={VoiceEagerness.Normal}>Normal</SelectItem>
              <SelectItem value={VoiceEagerness.High}>High — snappy (jumps in quickly)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            How quickly the agent responds after the student pauses.
          </p>
        </div>

        {/* Turn timeout */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Turn Timeout</Label>
            <span className="text-muted-foreground text-sm">{voiceTurnTimeoutSecs}s</span>
          </div>
          <Slider
            value={[voiceTurnTimeoutSecs]}
            onValueChange={([value]) => updateNumericField('voiceTurnTimeoutSecs', value)}
            min={3}
            max={20}
            step={1}
            disabled={viewOnly}
          />
          <p className="text-muted-foreground text-xs">
            Maximum silence before the agent prompts the student (default 7s).
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MistralAdvancedSection;
