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
import { Textarea } from '@/components/ui/textarea';

interface BasicInfoSectionProps {
  viewOnly?: boolean;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ viewOnly = false }) => {
  const { name, description, status, errors, touched, updateField, setFieldTouched } =
    useVoiceAgentFormStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Agent Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={e => updateField('name', e.target.value)}
            onBlur={() => setFieldTouched('name', true)}
            disabled={viewOnly}
            placeholder="e.g., Philosophy Exam Agent"
            aria-invalid={touched.name && !!errors.name}
          />
          {touched.name && errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={e => updateField('description', e.target.value)}
            disabled={viewOnly}
            placeholder="Brief description of what this agent does"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={value => updateField('status', value as 'draft' | 'active')}
            disabled={viewOnly}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            Only active agents are visible to all users
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoSection;
