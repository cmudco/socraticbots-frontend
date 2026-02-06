import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import type { BotFormData } from '@/schemas/botFormSchema';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const BotQuickPromptsStep: React.FC = () => {
  const { register, control } = useFormContext<BotFormData>();

  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: 'quickPrompts',
  });

  const handleAddPrompt = () => {
    append({ title: '', prompt: '', order: fields.length });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (dragIndex !== dropIndex) {
      swap(dragIndex, dropIndex);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label>Quick Prompts</Label>
          <p className="text-muted-foreground text-xs">
            Shortcut buttons users can click to send common prompts
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleAddPrompt}>
          <Plus className="mr-1 h-4 w-4" />
          Add Prompt
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center">
          <p>No quick prompts yet</p>
          <Button type="button" variant="link" size="sm" onClick={handleAddPrompt}>
            Add your first quick prompt
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              draggable
              onDragStart={e => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, index)}
              className="bg-muted/50 flex gap-3 rounded-lg border p-4"
            >
              <div className="text-muted-foreground flex cursor-grab items-center">
                <GripVertical className="h-5 w-5" />
              </div>

              <div className="flex-1 space-y-3">
                <Input
                  {...register(`quickPrompts.${index}.title`)}
                  placeholder="Button title (e.g., 'Explain this')"
                />
                <Textarea
                  {...register(`quickPrompts.${index}.prompt`)}
                  placeholder="Prompt text that will be sent..."
                  rows={2}
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BotQuickPromptsStep;
