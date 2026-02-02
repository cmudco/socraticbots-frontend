import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import type { BotFormData } from '@/schemas/botFormSchema';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BotThemeStep: React.FC = () => {
  const { register, control, watch } = useFormContext<BotFormData>();

  const colors = watch(['primaryColor', 'accentColor', 'backgroundColor', 'foregroundColor']);

  return (
    <div className="space-y-6">
      {/* Color Pickers */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="primaryColor">Primary Color</Label>
          <div className="flex gap-2">
            <Input type="color" {...register('primaryColor')} className="h-10 w-16 p-1" />
            <Input {...register('primaryColor')} placeholder="#8b5cf6" className="flex-1" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accentColor">Accent Color</Label>
          <div className="flex gap-2">
            <Input type="color" {...register('accentColor')} className="h-10 w-16 p-1" />
            <Input {...register('accentColor')} placeholder="#a78bfa" className="flex-1" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="backgroundColor">Background Color</Label>
          <div className="flex gap-2">
            <Input type="color" {...register('backgroundColor')} className="h-10 w-16 p-1" />
            <Input {...register('backgroundColor')} placeholder="#ffffff" className="flex-1" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="foregroundColor">Text Color</Label>
          <div className="flex gap-2">
            <Input type="color" {...register('foregroundColor')} className="h-10 w-16 p-1" />
            <Input {...register('foregroundColor')} placeholder="#0f172a" className="flex-1" />
          </div>
        </div>
      </div>

      {/* Typography & Spacing */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fontFamily">Font Family</Label>
          <Controller
            name="fontFamily"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sans">Sans-serif</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="mono">Monospace</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fontSize">Font Size</Label>
          <Controller
            name="fontSize"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xs">Extra Small</SelectItem>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="xl">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="borderRadius">Border Radius</Label>
          <Controller
            name="borderRadius"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="md">Medium</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="xl">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="messageSpacing">Message Spacing</Label>
          <Controller
            name="messageSpacing"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Theme Preview */}
      <div className="rounded-lg border p-4">
        <Label className="mb-3 block">Preview</Label>
        <div className="rounded-lg p-4" style={{ backgroundColor: colors[2], color: colors[3] }}>
          <div
            className="mb-2 inline-block rounded px-3 py-1 text-white"
            style={{ backgroundColor: colors[0] }}
          >
            Primary Button
          </div>
          <div
            className="inline-block rounded px-3 py-1"
            style={{ backgroundColor: colors[1], color: colors[3] }}
          >
            Accent Element
          </div>
          <p className="mt-3 text-sm">This is how text will appear in the chat interface.</p>
        </div>
      </div>
    </div>
  );
};

export default BotThemeStep;
