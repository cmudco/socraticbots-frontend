import React, { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import {
  type BotFormData,
  DEFAULT_BOT_FORM_VALUES,
  botFormSchema,
  mapBotToFormData,
  mapFormDataToPayload,
} from '@/schemas/botFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Bot,
  Check,
  ChevronDown,
  Files,
  Loader2,
  Paintbrush,
  Rocket,
  Save,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';

import { useBot, useCreateBot, useUpdateBot } from '@/hooks/queries/useBots';
import { useIsCreator } from '@/hooks/queries/useUser';

import { useToastStore } from '@/stores/ui/toastStore';

import { cn } from '@/lib/utils';

import BotBasicInfoStep from '@/components/bots/steps/BotBasicInfoStep';
import BotDeploymentStep from '@/components/bots/steps/BotDeploymentStep';
import BotFilesStep from '@/components/bots/steps/BotFilesStep';
import BotPromptsStep from '@/components/bots/steps/BotPromptsStep';
import BotQuickPromptsStep from '@/components/bots/steps/BotQuickPromptsStep';
import BotThemeStep from '@/components/bots/steps/BotThemeStep';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ============================================================================
// Types
// ============================================================================

interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  optional?: boolean;
  creatorOnly?: boolean;
  editOnly?: boolean;
}

// ============================================================================
// Component
// ============================================================================

const BotEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { botGroupId, botId } = useParams<{ botGroupId: string; botId?: string }>();
  const isCreator = useIsCreator();
  const { addToast } = useToastStore();

  const isEdit = !!botId && botId !== 'new';
  const numericBotGroupId = parseInt(botGroupId || '0', 10);
  const numericBotId = isEdit ? parseInt(botId || '0', 10) : 0;

  // Fetch bot data for edit mode
  const { data: bot, isLoading: botLoading } = useBot(numericBotGroupId, numericBotId, isEdit);

  // Form setup with React Hook Form + Zod
  const form = useForm<BotFormData>({
    resolver: zodResolver(botFormSchema),
    defaultValues: DEFAULT_BOT_FORM_VALUES,
    mode: 'onChange',
  });

  const createBotMutation = useCreateBot();
  const updateBotMutation = useUpdateBot();

  // Accordion state - track open sections
  const [openSections, setOpenSections] = useState<string[]>(['basic']);

  // Define all configuration sections
  const allSections: ConfigSection[] = useMemo(
    () => [
      {
        id: 'basic',
        title: 'Basic Info',
        description: 'Title, subject, agent, and settings',
        icon: <Settings className="h-5 w-5" />,
      },
      {
        id: 'prompts',
        title: 'Prompts',
        description: 'Greeting and system prompts',
        icon: <Sparkles className="h-5 w-5" />,
        optional: true,
      },
      {
        id: 'quick-prompts',
        title: 'Quick Prompts',
        description: 'Shortcut buttons for common actions',
        icon: <Zap className="h-5 w-5" />,
        optional: true,
      },
      {
        id: 'theme',
        title: 'Theme',
        description: 'Colors and visual styling',
        icon: <Paintbrush className="h-5 w-5" />,
        optional: true,
      },
      {
        id: 'files',
        title: 'Files',
        description: 'Knowledge base documents',
        icon: <Files className="h-5 w-5" />,
        optional: true,
        creatorOnly: true,
        editOnly: true,
      },
      {
        id: 'deployment',
        title: 'Deployment',
        description: 'Access codes and public settings',
        icon: <Rocket className="h-5 w-5" />,
        optional: true,
        creatorOnly: true,
        editOnly: true,
      },
    ],
    []
  );

  // Filter sections based on mode and user role
  const sections = useMemo(() => {
    return allSections.filter(section => {
      if (section.creatorOnly && !isCreator) return false;
      if (section.editOnly && !isEdit) return false;
      return true;
    });
  }, [allSections, isCreator, isEdit]);

  // Load bot data when editing
  useEffect(() => {
    if (isEdit && bot) {
      const formData = mapBotToFormData(bot);
      form.reset(formData);
    }
  }, [isEdit, bot]);

  // Toggle section open/closed
  const toggleSection = (sectionId: string) => {
    setOpenSections(prev =>
      prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
    );
  };

  // Form submission
  const onSubmit = async (data: BotFormData) => {
    try {
      const payload = mapFormDataToPayload(data);

      if (isEdit) {
        await updateBotMutation.mutateAsync({
          botGroupId: numericBotGroupId,
          botId: numericBotId,
          botData: payload,
        });
        addToast({ message: 'Bot updated successfully', type: 'success' });
      } else {
        await createBotMutation.mutateAsync({
          botGroupId: numericBotGroupId,
          botData: payload,
        });
        addToast({ message: 'Bot created successfully', type: 'success' });
      }

      navigate('/bot-groups');
    } catch (error) {
      console.error('Error saving bot:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save bot. Please try again.';
      addToast({ message: errorMessage, type: 'error' });
    }
  };

  // Render section content
  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'basic':
        return <BotBasicInfoStep />;
      case 'prompts':
        return <BotPromptsStep />;
      case 'quick-prompts':
        return <BotQuickPromptsStep />;
      case 'theme':
        return <BotThemeStep />;
      case 'files':
        return <BotFilesStep botGroupId={numericBotGroupId} botId={numericBotId} />;
      case 'deployment':
        return <BotDeploymentStep botId={numericBotId} />;
      default:
        return null;
    }
  };

  // Loading state
  if (isEdit && botLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading bot...</p>
        </div>
      </div>
    );
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="container mx-auto max-w-3xl px-4 py-6"
      >
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/bot-groups')} type="button">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
              <Bot className="text-primary h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{isEdit ? 'Edit Bot' : 'Create New Bot'}</h1>
              <p className="text-muted-foreground text-sm">
                {isEdit ? 'Update your bot configuration' : 'Set up your new AI assistant'}
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Sections */}
        <div className="space-y-3">
          {sections.map((section, index) => {
            const isOpen = openSections.includes(section.id);

            return (
              <div
                key={section.id}
                className={cn(
                  'bg-card border-border overflow-hidden rounded-xl border transition-all duration-200',
                  isOpen && 'ring-primary/20 ring-2'
                )}
              >
                {/* Section Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    'flex w-full items-center gap-4 p-4 text-left transition-colors',
                    'hover:bg-muted/50',
                    isOpen && 'border-border border-b'
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                      isOpen
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {section.icon}
                  </div>

                  {/* Title & Description */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{section.title}</span>
                      {section.optional && (
                        <Badge variant="secondary" className="text-xs">
                          Optional
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground truncate text-sm">{section.description}</p>
                  </div>

                  {/* Step number & Chevron */}
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm font-medium">
                      {index + 1}/{sections.length}
                    </span>
                    <ChevronDown
                      className={cn(
                        'text-muted-foreground h-5 w-5 transition-transform duration-200',
                        isOpen && 'rotate-180'
                      )}
                    />
                  </div>
                </button>

                {/* Section Content */}
                <div
                  className={cn(
                    'grid transition-all duration-200 ease-in-out',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="p-6">{renderSectionContent(section.id)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/bot-groups')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {isEdit ? <Save className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                {isEdit ? 'Save Changes' : 'Create Bot'}
              </span>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default BotEditPage;
