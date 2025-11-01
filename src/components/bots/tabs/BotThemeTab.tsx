import React, { forwardRef } from 'react';

import { Form, Formik, FormikProps } from 'formik';

import { useBotFormStore } from '@/stores/forms/botFormStore';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormValues {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  messageSpacing: 'compact' | 'normal' | 'relaxed';
}

interface BotThemeTabProps {
  viewOnly?: boolean;
}

const BotThemeTab = forwardRef<FormikProps<FormValues>, BotThemeTabProps>(
  ({ viewOnly = false }, ref) => {
    const {
      primaryColor,
      accentColor,
      backgroundColor,
      foregroundColor,
      fontFamily,
      fontSize,
      borderRadius,
      messageSpacing,
      updateThemeField,
    } = useBotFormStore();

    const initialValues: FormValues = {
      primaryColor,
      accentColor,
      backgroundColor,
      foregroundColor,
      fontFamily,
      fontSize,
      borderRadius,
      messageSpacing,
    };

    return (
      <div className="space-y-6">
        <Formik
          innerRef={ref}
          initialValues={initialValues}
          enableReinitialize
          onSubmit={() => {}} // Handled by parent
        >
          {({ values }) => (
            <Form className="space-y-6">
              {/* Color Section */}
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-foreground text-sm font-semibold">Color Palette</h3>
                  <p className="text-muted-foreground text-xs">
                    Customize the colors for your bot's chat interface
                  </p>
                </div>

                {/* Primary Color */}
                <div>
                  <label
                    htmlFor="primaryColor"
                    className="text-foreground mb-2 block text-sm font-medium"
                  >
                    Primary Color
                  </label>
                  <p className="text-muted-foreground mb-2 text-xs">
                    Main brand color for buttons and highlights
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      id="primaryColor"
                      name="primaryColor"
                      type="color"
                      disabled={viewOnly}
                      value={values.primaryColor}
                      onChange={e => updateThemeField('primaryColor', e.target.value)}
                      className="border-input h-10 w-20 cursor-pointer rounded-md border"
                    />
                    <input
                      type="text"
                      disabled={viewOnly}
                      value={values.primaryColor}
                      onChange={e => updateThemeField('primaryColor', e.target.value)}
                      className="border-input focus:border-ring focus:ring-ring disabled:bg-muted flex-1 rounded-md border px-3 py-2 font-mono text-sm disabled:cursor-not-allowed"
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label
                    htmlFor="accentColor"
                    className="text-foreground mb-2 block text-sm font-medium"
                  >
                    Accent Color
                  </label>
                  <p className="text-muted-foreground mb-2 text-xs">
                    Secondary color for subtle highlights
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      id="accentColor"
                      name="accentColor"
                      type="color"
                      disabled={viewOnly}
                      value={values.accentColor}
                      onChange={e => updateThemeField('accentColor', e.target.value)}
                      className="border-input h-10 w-20 cursor-pointer rounded-md border"
                    />
                    <input
                      type="text"
                      disabled={viewOnly}
                      value={values.accentColor}
                      onChange={e => updateThemeField('accentColor', e.target.value)}
                      className="border-input focus:border-ring focus:ring-ring disabled:bg-muted flex-1 rounded-md border px-3 py-2 font-mono text-sm disabled:cursor-not-allowed"
                      placeholder="#a78bfa"
                    />
                  </div>
                </div>

                {/* Background Color */}
                <div>
                  <label
                    htmlFor="backgroundColor"
                    className="text-foreground mb-2 block text-sm font-medium"
                  >
                    Background Color
                  </label>
                  <p className="text-muted-foreground mb-2 text-xs">
                    Main background color for the chat interface
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      id="backgroundColor"
                      name="backgroundColor"
                      type="color"
                      disabled={viewOnly}
                      value={values.backgroundColor}
                      onChange={e => updateThemeField('backgroundColor', e.target.value)}
                      className="border-input h-10 w-20 cursor-pointer rounded-md border"
                    />
                    <input
                      type="text"
                      disabled={viewOnly}
                      value={values.backgroundColor}
                      onChange={e => updateThemeField('backgroundColor', e.target.value)}
                      className="border-input focus:border-ring focus:ring-ring disabled:bg-muted flex-1 rounded-md border px-3 py-2 font-mono text-sm disabled:cursor-not-allowed"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                {/* Foreground Color */}
                <div>
                  <label
                    htmlFor="foregroundColor"
                    className="text-foreground mb-2 block text-sm font-medium"
                  >
                    Text Color
                  </label>
                  <p className="text-muted-foreground mb-2 text-xs">
                    Primary text color for readability
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      id="foregroundColor"
                      name="foregroundColor"
                      type="color"
                      disabled={viewOnly}
                      value={values.foregroundColor}
                      onChange={e => updateThemeField('foregroundColor', e.target.value)}
                      className="border-input h-10 w-20 cursor-pointer rounded-md border"
                    />
                    <input
                      type="text"
                      disabled={viewOnly}
                      value={values.foregroundColor}
                      onChange={e => updateThemeField('foregroundColor', e.target.value)}
                      className="border-input focus:border-ring focus:ring-ring disabled:bg-muted flex-1 rounded-md border px-3 py-2 font-mono text-sm disabled:cursor-not-allowed"
                      placeholder="#0f172a"
                    />
                  </div>
                </div>
              </div>

              {/* Typography Section */}
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-foreground text-sm font-semibold">Typography</h3>
                  <p className="text-muted-foreground text-xs">
                    Configure font settings for your bot
                  </p>
                </div>

                {/* Font Family */}
                <div>
                  <label
                    htmlFor="fontFamily"
                    className="text-foreground mb-2 block text-sm font-medium"
                  >
                    Font Family
                  </label>
                  <p className="text-muted-foreground mb-2 text-xs">
                    Choose the typeface style for your bot
                  </p>
                  <Select
                    disabled={viewOnly}
                    value={values.fontFamily}
                    onValueChange={value => updateThemeField('fontFamily', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select font family" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sans">
                        <div className="flex flex-col">
                          <span className="font-sans font-medium">Sans Serif</span>
                          <span className="text-muted-foreground text-xs">Modern and clean</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="serif">
                        <div className="flex flex-col">
                          <span className="font-serif font-medium">Serif</span>
                          <span className="text-muted-foreground text-xs">Classic and formal</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="mono">
                        <div className="flex flex-col">
                          <span className="font-mono font-medium">Monospace</span>
                          <span className="text-muted-foreground text-xs">
                            Technical and precise
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Size */}
                <div>
                  <label
                    htmlFor="fontSize"
                    className="text-foreground mb-2 block text-sm font-medium"
                  >
                    Font Size
                  </label>
                  <p className="text-muted-foreground mb-2 text-xs">
                    Adjust the base font size for readability
                  </p>
                  <Select
                    disabled={viewOnly}
                    value={values.fontSize}
                    onValueChange={value => updateThemeField('fontSize', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xs">
                        <div className="flex items-center justify-between gap-4">
                          <span>Extra Small</span>
                          <span className="text-muted-foreground text-xs">12px</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="sm">
                        <div className="flex items-center justify-between gap-4">
                          <span>Small</span>
                          <span className="text-muted-foreground text-xs">14px</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="base">
                        <div className="flex items-center justify-between gap-4">
                          <span>Base</span>
                          <span className="text-muted-foreground text-xs">16px</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="lg">
                        <div className="flex items-center justify-between gap-4">
                          <span>Large</span>
                          <span className="text-muted-foreground text-xs">18px</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="xl">
                        <div className="flex items-center justify-between gap-4">
                          <span>Extra Large</span>
                          <span className="text-muted-foreground text-xs">20px</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Layout Section */}
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-foreground text-sm font-semibold">Layout & Spacing</h3>
                  <p className="text-muted-foreground text-xs">
                    Customize the visual layout of your bot
                  </p>
                </div>

                {/* Border Radius */}
                <div>
                  <label
                    htmlFor="borderRadius"
                    className="text-foreground mb-2 block text-sm font-medium"
                  >
                    Border Radius
                  </label>
                  <p className="text-muted-foreground mb-2 text-xs">
                    Adjust the roundness of corners
                  </p>
                  <Select
                    disabled={viewOnly}
                    value={values.borderRadius}
                    onValueChange={value => updateThemeField('borderRadius', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select border radius" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center justify-between gap-4">
                          <span>None</span>
                          <span className="text-muted-foreground text-xs">0px - Sharp corners</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="sm">
                        <div className="flex items-center justify-between gap-4">
                          <span>Small</span>
                          <span className="text-muted-foreground text-xs">
                            2px - Subtle rounding
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="md">
                        <div className="flex items-center justify-between gap-4">
                          <span>Medium</span>
                          <span className="text-muted-foreground text-xs">6px - Balanced</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="lg">
                        <div className="flex items-center justify-between gap-4">
                          <span>Large</span>
                          <span className="text-muted-foreground text-xs">8px - Smooth</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="xl">
                        <div className="flex items-center justify-between gap-4">
                          <span>Extra Large</span>
                          <span className="text-muted-foreground text-xs">12px - Very round</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Message Spacing */}
                <div>
                  <label
                    htmlFor="messageSpacing"
                    className="text-foreground mb-2 block text-sm font-medium"
                  >
                    Message Spacing
                  </label>
                  <p className="text-muted-foreground mb-2 text-xs">
                    Control the spacing between chat messages
                  </p>
                  <Select
                    disabled={viewOnly}
                    value={values.messageSpacing}
                    onValueChange={value => updateThemeField('messageSpacing', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select message spacing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">
                        <div className="flex flex-col">
                          <span className="font-medium">Compact</span>
                          <span className="text-muted-foreground text-xs">
                            Minimal spacing for dense conversations
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="normal">
                        <div className="flex flex-col">
                          <span className="font-medium">Normal</span>
                          <span className="text-muted-foreground text-xs">
                            Balanced spacing for readability
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="relaxed">
                        <div className="flex flex-col">
                          <span className="font-medium">Relaxed</span>
                          <span className="text-muted-foreground text-xs">
                            Generous spacing for comfortable reading
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Theme Preview */}
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-foreground text-sm font-semibold">Preview</h3>
                  <p className="text-muted-foreground text-xs">See how your theme will look</p>
                </div>

                <div
                  className="border-border overflow-hidden rounded-lg border"
                  style={{ backgroundColor: values.backgroundColor }}
                >
                  <div
                    className="p-4"
                    style={{
                      fontFamily:
                        values.fontFamily === 'sans'
                          ? 'var(--font-sans)'
                          : values.fontFamily === 'serif'
                            ? 'var(--font-serif)'
                            : 'var(--font-mono)',
                    }}
                  >
                    {/* Preview Messages */}
                    <div
                      className={`space-y-${values.messageSpacing === 'compact' ? '2' : values.messageSpacing === 'normal' ? '4' : '6'}`}
                    >
                      {/* User Message */}
                      <div className="flex justify-end">
                        <div
                          className="max-w-[80%] px-4 py-2"
                          style={{
                            backgroundColor: values.primaryColor,
                            color: '#ffffff',
                            borderRadius:
                              values.borderRadius === 'none'
                                ? '0'
                                : values.borderRadius === 'sm'
                                  ? '0.125rem'
                                  : values.borderRadius === 'md'
                                    ? '0.375rem'
                                    : values.borderRadius === 'lg'
                                      ? '0.5rem'
                                      : '0.75rem',
                            fontSize:
                              values.fontSize === 'xs'
                                ? '0.75rem'
                                : values.fontSize === 'sm'
                                  ? '0.875rem'
                                  : values.fontSize === 'base'
                                    ? '1rem'
                                    : values.fontSize === 'lg'
                                      ? '1.125rem'
                                      : '1.25rem',
                          }}
                        >
                          Hello! Can you help me with a question?
                        </div>
                      </div>

                      {/* Bot Message */}
                      <div className="flex justify-start">
                        <div
                          className="max-w-[80%] px-4 py-2"
                          style={{
                            backgroundColor: values.accentColor,
                            color: values.foregroundColor,
                            borderRadius:
                              values.borderRadius === 'none'
                                ? '0'
                                : values.borderRadius === 'sm'
                                  ? '0.125rem'
                                  : values.borderRadius === 'md'
                                    ? '0.375rem'
                                    : values.borderRadius === 'lg'
                                      ? '0.5rem'
                                      : '0.75rem',
                            fontSize:
                              values.fontSize === 'xs'
                                ? '0.75rem'
                                : values.fontSize === 'sm'
                                  ? '0.875rem'
                                  : values.fontSize === 'base'
                                    ? '1rem'
                                    : values.fontSize === 'lg'
                                      ? '1.125rem'
                                      : '1.25rem',
                          }}
                        >
                          Of course! I'm here to help. What would you like to know?
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    );
  }
);

BotThemeTab.displayName = 'BotThemeTab';

export default BotThemeTab;
