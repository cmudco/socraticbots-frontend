import React from 'react';

import { useCreateBotGroup, useUpdateBotGroup } from '@/hooks/queries/useBotGroups';

import { useBotGroupFormStore } from '@/stores/forms/botGroupFormStore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BotGroupBasicInfoTabProps {
  botGroupId?: number;
  onClose: () => void;
}

const BotGroupBasicInfoTab: React.FC<BotGroupBasicInfoTabProps> = ({ botGroupId, onClose }) => {
  const { title, description, errors, touched, updateField, setFieldTouched, validateForm } =
    useBotGroupFormStore();

  const createMutation = useCreateBotGroup();
  const updateMutation = useUpdateBotGroup();

  const isEdit = !!botGroupId;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: botGroupId,
          botGroupData: { title, description },
        });
      } else {
        await createMutation.mutateAsync({ title, description });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save bot group:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={e => updateField('title', e.target.value)}
          onBlur={() => setFieldTouched('title', true)}
          placeholder="e.g., Introduction to Biology"
          className={errors.title && touched.title ? 'border-destructive' : ''}
        />
        {errors.title && touched.title && (
          <p className="text-destructive text-sm">{errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={e => updateField('description', e.target.value)}
          onBlur={() => setFieldTouched('description', true)}
          placeholder="Describe what this bot group covers..."
          rows={4}
          className={errors.description && touched.description ? 'border-destructive' : ''}
        />
        {errors.description && touched.description && (
          <p className="text-destructive text-sm">{errors.description}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t pt-6">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving...
            </>
          ) : isEdit ? (
            'Update Group'
          ) : (
            'Create Group'
          )}
        </Button>
      </div>
    </div>
  );
};

export default BotGroupBasicInfoTab;
