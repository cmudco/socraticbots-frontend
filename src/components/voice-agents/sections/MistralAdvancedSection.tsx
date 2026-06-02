import React, { useMemo } from 'react';

import { useMistralVoices } from '@/hooks/queries/useMistralVoices';

import { useVoiceAgentFormStore } from '@/stores/forms/voiceAgentFormStore';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Slider } from '@/components/ui/slider';

import { MistralVoice, VoiceEagerness, VoiceProvider } from '@/types/voiceAgent';

const DEFAULT_VOICE_SLUG = 'en_paul_neutral';

interface MistralAdvancedSectionProps {
  viewOnly?: boolean;
}

/**
 * Mistral-only advanced settings: examiner voice (live from Mistral's
 * catalog), eagerness (how quickly the agent jumps in after the student
 * pauses), and turn timeout (max silence before the agent prompts).
 * Rendered only when provider is Mistral Voxtral.
 */
export const MistralAdvancedSection: React.FC<MistralAdvancedSectionProps> = ({
  viewOnly = false,
}) => {
  const {
    voiceProvider,
    voiceId,
    voiceEagerness,
    voiceTurnTimeoutSecs,
    updateField,
    updateNumericField,
  } = useVoiceAgentFormStore();

  const isMistral = voiceProvider === VoiceProvider.MistralVoice;
  const { data, isLoading, isError } = useMistralVoices(isMistral);

  // Group voices by locale for a tidy dropdown.
  const grouped = useMemo(() => {
    const map = new Map<string, MistralVoice[]>();
    for (const v of data?.voices ?? []) {
      if (!map.has(v.locale)) map.set(v.locale, []);
      map.get(v.locale)!.push(v);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [data?.voices]);

  if (!isMistral) return null;

  const selectedVoice = voiceId || DEFAULT_VOICE_SLUG;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mistral Voice Settings</CardTitle>
        <CardDescription>
          Examiner voice, response speed, and silence handling for the Voxtral voice agent.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice picker */}
        <div className="space-y-2">
          <Label>Examiner Voice</Label>
          <Select
            value={selectedVoice}
            onValueChange={value => updateField('voiceId', value)}
            disabled={viewOnly || isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  isLoading ? 'Loading voices…' : isError ? 'Could not load voices' : undefined
                }
              />
            </SelectTrigger>
            <SelectContent>
              {grouped.map(([locale, voices]) => (
                <SelectGroup key={locale}>
                  <SelectLabel>{locale}</SelectLabel>
                  {voices.map(v => (
                    <SelectItem key={v.slug} value={v.slug}>
                      {v.label}
                      {v.description ? ` — ${v.description}` : ''}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            {isError
              ? "Couldn't load Mistral's voice catalog; the agent will use the default voice."
              : `${data?.total ?? 0} voices available, grouped by language. Default is Paul (Neutral, US).`}
          </p>
        </div>

        {/* Eagerness */}
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
