import React from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { useVoiceAgentFormStore } from '@/stores/forms/voiceAgentFormStore';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

import { SpellingPatience, TurnEagerness, VoiceProvider } from '@/types/voiceAgent';

interface AdvancedSettingsSectionProps {
  viewOnly?: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export const AdvancedSettingsSection: React.FC<AdvancedSettingsSectionProps> = ({
  viewOnly = false,
  collapsible = true,
  defaultOpen = false,
}) => {
  const {
    showAdvanced,
    voiceProvider,
    toggleAdvanced,
    setShowAdvanced,
    turnEagerness,
    turnTimeout,
    spellingPatience,
    ttsStability,
    ttsSpeed,
    ttsSimilarityBoost,
    llmModel,
    updateField,
    updateNumericField,
  } = useVoiceAgentFormStore();

  // Set initial open state based on defaultOpen prop
  React.useEffect(() => {
    if (defaultOpen && !showAdvanced) {
      setShowAdvanced(true);
    }
  }, [defaultOpen, setShowAdvanced, showAdvanced]);

  if (voiceProvider !== VoiceProvider.ElevenLabs) {
    return null;
  }

  const content = (
    <div className="space-y-6">
      {/* Turn Settings */}
      <div className="space-y-3">
        <h3 className="text-muted-foreground text-sm font-medium">Turn Settings</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Eagerness</Label>
            <Select
              value={turnEagerness}
              onValueChange={value => updateField('turnEagerness', value as TurnEagerness)}
              disabled={viewOnly}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">How quickly the agent responds</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Turn Timeout</Label>
              <span className="text-muted-foreground text-sm">{turnTimeout}s</span>
            </div>
            <Slider
              value={[turnTimeout]}
              onValueChange={([value]) => updateNumericField('turnTimeout', value)}
              min={1}
              max={30}
              step={1}
              disabled={viewOnly}
            />
            <p className="text-muted-foreground text-xs">Seconds before timeout</p>
          </div>

          <div className="space-y-2">
            <Label>Spelling Patience</Label>
            <Select
              value={spellingPatience}
              onValueChange={value => updateField('spellingPatience', value as SpellingPatience)}
              disabled={viewOnly}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">Patience for spelling out words</p>
          </div>
        </div>
      </div>

      {/* TTS Settings */}
      <div className="space-y-3 border-t pt-4">
        <h3 className="text-muted-foreground text-sm font-medium">Voice Settings (TTS)</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Stability</Label>
              <span className="text-muted-foreground text-sm">{ttsStability}</span>
            </div>
            <Slider
              value={[ttsStability]}
              onValueChange={([value]) => updateNumericField('ttsStability', value)}
              min={0}
              max={1}
              step={0.05}
              disabled={viewOnly}
            />
            <p className="text-muted-foreground text-xs">Higher = more consistent voice</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Speed</Label>
              <span className="text-muted-foreground text-sm">{ttsSpeed}x</span>
            </div>
            <Slider
              value={[ttsSpeed]}
              onValueChange={([value]) => updateNumericField('ttsSpeed', value)}
              min={0.5}
              max={2}
              step={0.1}
              disabled={viewOnly}
            />
            <p className="text-muted-foreground text-xs">Speech speed multiplier</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Similarity</Label>
              <span className="text-muted-foreground text-sm">{ttsSimilarityBoost}</span>
            </div>
            <Slider
              value={[ttsSimilarityBoost]}
              onValueChange={([value]) => updateNumericField('ttsSimilarityBoost', value)}
              min={0}
              max={1}
              step={0.05}
              disabled={viewOnly}
            />
            <p className="text-muted-foreground text-xs">Voice similarity boost</p>
          </div>
        </div>
      </div>

      {/* LLM Settings */}
      <div className="space-y-3 border-t pt-4">
        <h3 className="text-muted-foreground text-sm font-medium">LLM Settings</h3>
        <div className="space-y-2">
          <Label htmlFor="llmModel">LLM Model (optional)</Label>
          <Input
            id="llmModel"
            value={llmModel}
            onChange={e => updateField('llmModel', e.target.value)}
            disabled={viewOnly}
            placeholder="Leave empty for default"
          />
          <p className="text-muted-foreground text-xs">e.g., gpt-4o, claude-3-5-sonnet</p>
        </div>
      </div>
    </div>
  );

  if (collapsible) {
    return (
      <Card>
        <button
          type="button"
          onClick={toggleAdvanced}
          className="flex w-full items-center justify-between p-6 text-left"
        >
          <div>
            <CardTitle className="text-lg">Advanced ElevenLabs Settings</CardTitle>
            <CardDescription className="mt-1">
              Fine-tune conversation behavior, voice output, and LLM settings
            </CardDescription>
          </div>
          {showAdvanced ? (
            <ChevronUp className="text-muted-foreground h-5 w-5" />
          ) : (
            <ChevronDown className="text-muted-foreground h-5 w-5" />
          )}
        </button>
        {showAdvanced && <CardContent className="border-t pt-6">{content}</CardContent>}
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced ElevenLabs Settings</CardTitle>
        <CardDescription>
          Fine-tune conversation behavior, voice output, and LLM settings
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default AdvancedSettingsSection;
