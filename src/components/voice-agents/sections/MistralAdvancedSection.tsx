import React from 'react';

import { useVoiceBrainModels } from '@/hooks/queries/useVoiceAgents';

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

import { VoiceEagerness, VoiceProvider, VoiceTurnMode } from '@/types/voiceAgent';

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
  const {
    voiceProvider,
    voiceEagerness,
    voiceTurnMode,
    voiceTurnTimeoutSecs,
    brainModel,
    updateField,
    updateNumericField,
  } = useVoiceAgentFormStore();

  const isMistral = voiceProvider === VoiceProvider.MistralVoice;
  const { data: brainModels, isLoading: brainModelsLoading } = useVoiceBrainModels(isMistral);

  if (!isMistral) return null;

  const knownBrainModel = brainModels?.models.some(model => model.id === brainModel);

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
          <Label>Brain Model</Label>
          <Select
            value={brainModel}
            onValueChange={value => updateField('brainModel', value)}
            disabled={viewOnly || brainModelsLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={brainModelsLoading ? 'Loading models…' : undefined} />
            </SelectTrigger>
            <SelectContent>
              {brainModels?.models.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  {model.label} — {model.provider}
                </SelectItem>
              ))}
              {!knownBrainModel && <SelectItem value={brainModel}>{brainModel}</SelectItem>}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            The language model that thinks up the examiner&apos;s replies. If it stalls, the runtime
            automatically falls back to the next available model.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Turn Taking</Label>
          <Select
            value={voiceTurnMode}
            onValueChange={value => updateField('voiceTurnMode', value as VoiceTurnMode)}
            disabled={viewOnly}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={VoiceTurnMode.Auto}>
                Automatic — the agent detects when the student stops talking
              </SelectItem>
              <SelectItem value={VoiceTurnMode.PushToTalk}>
                Push to talk — the student presses Talk to start and to finish
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            Push to talk stops background noise from cutting students off. The exam timer keeps
            running either way.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Eagerness</Label>
          <Select
            value={voiceEagerness}
            onValueChange={value => updateField('voiceEagerness', value as VoiceEagerness)}
            disabled={viewOnly || voiceTurnMode === VoiceTurnMode.PushToTalk}
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
