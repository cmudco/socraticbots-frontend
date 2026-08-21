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

import { VoiceProvider } from '@/types/voiceAgent';

interface ProviderSectionProps {
  viewOnly?: boolean;
}

export const ProviderSection: React.FC<ProviderSectionProps> = ({ viewOnly = false }) => {
  const { voiceProvider, updateField } = useVoiceAgentFormStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Runtime</CardTitle>
        <CardDescription>Select which provider powers this voice assignment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label>Provider</Label>
          <Select
            value={voiceProvider}
            onValueChange={value => updateField('voiceProvider', value as VoiceProvider)}
            disabled={viewOnly}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={VoiceProvider.MistralVoice}>Mistral Voice (preferred)</SelectItem>
              <SelectItem value={VoiceProvider.ElevenLabs}>ElevenLabs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderSection;
