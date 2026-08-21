import React from 'react';

import { useVoiceAgentFormStore } from '@/stores/forms/voiceAgentFormStore';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ExamConfigSectionProps {
  viewOnly?: boolean;
}

export const ExamConfigSection: React.FC<ExamConfigSectionProps> = ({ viewOnly = false }) => {
  const { examTitle, examInstructions, updateField } = useVoiceAgentFormStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="examTitle">Assignment Title</Label>
          <Input
            id="examTitle"
            value={examTitle}
            onChange={e => updateField('examTitle', e.target.value)}
            disabled={viewOnly}
            placeholder="e.g., Introduction to Philosophy - Week 3 Reflection"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="examInstructions">Instructions for Students</Label>
          <Textarea
            id="examInstructions"
            value={examInstructions}
            onChange={e => updateField('examInstructions', e.target.value)}
            disabled={viewOnly}
            placeholder="Instructions shown to students before starting the assignment..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamConfigSection;
