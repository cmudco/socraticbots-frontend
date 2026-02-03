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
  ChevronLeft,
  ChevronRight,
  Files,
  LayoutList,
  Loader2,
  Mic,
  Paintbrush,
  Rocket,
  Save,
  Settings,
  Sparkles,
  Workflow,
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
import BotVoiceAgentStep from '@/components/bots/steps/BotVoiceAgentStep';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stepper, type StepperStep } from '@/components/ui/stepper';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ============================================================================
// Types
// ============================================================================

type ViewMode = 'accordion' | 'stepper';

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

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('accordion');

  // Accordion state - track open sections
  const [openSections, setOpenSections] = useState<string[]>(['basic']);

  // Stepper state - track current step
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

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
      {
        id: 'voice-agent',
        title: 'Voice Agent',
        description: 'Voice exam configuration',
        icon: <Mic className="h-5 w-5" />,
        optional: true,
        creatorOnly: true,
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

  // Convert sections to stepper steps
  const stepperSteps: StepperStep[] = useMemo(() => {
    return sections.map(section => ({
      id: section.id,
      title: section.title,
      description: section.description,
      icon: section.icon,
      optional: section.optional,
    }));
  }, [sections]);

  // Load bot data when editing
  useEffect(() => {
    if (isEdit && bot) {
      const formData = mapBotToFormData(bot);
      form.reset(formData);
    }
  }, [isEdit, bot]);

  // Toggle section open/closed (accordion mode)
  const toggleSection = (sectionId: string) => {
    setOpenSections(prev =>
      prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
    );
  };

  // Navigate to next step (stepper mode)
  const goToNextStep = () => {
    if (currentStep < sections.length - 1) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  // Navigate to previous step (stepper mode)
  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Handle step click in stepper
  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
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
      case 'voice-agent':
        return <BotVoiceAgentStep />;
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
  const currentSection = sections[currentStep];

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto w-full max-w-[80%] px-4 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/bot-groups')}
              type="button"
            >
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

          {/* View Toggle */}
          <TooltipProvider>
            <div className="bg-muted flex items-center gap-1 rounded-lg p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setViewMode('accordion')}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-md transition-colors',
                      viewMode === 'accordion'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <LayoutList className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Accordion View</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setViewMode('stepper')}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-md transition-colors',
                      viewMode === 'stepper'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Workflow className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Stepper View</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        {/* ============ ACCORDION VIEW ============ */}
        {viewMode === 'accordion' && (
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
                      <p className="text-muted-foreground truncate text-sm">
                        {section.description}
                      </p>
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
        )}

        {/* ============ STEPPER VIEW ============ */}
        {viewMode === 'stepper' && (
          <div className="space-y-6">
            {/* Horizontal Stepper */}
            <div className="bg-card border-border rounded-xl border p-6">
              <Stepper
                steps={stepperSteps}
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={handleStepClick}
                orientation="horizontal"
                allowClickAhead
              />
            </div>

            {/* Current Step Content */}
            <div className="bg-card border-border rounded-xl border">
              {/* Step Header */}
              <div className="border-border flex items-center gap-4 border-b p-6">
                <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  {currentSection?.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{currentSection?.title}</h2>
                    {currentSection?.optional && (
                      <Badge variant="secondary" className="text-xs">
                        Optional
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{currentSection?.description}</p>
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6">{currentSection && renderSectionContent(currentSection.id)}</div>

              {/* Step Navigation */}
              <div className="border-border flex items-center justify-between border-t px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPrevStep}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <span className="text-muted-foreground text-sm">
                  Step {currentStep + 1} of {sections.length}
                </span>

                {currentStep < sections.length - 1 ? (
                  <Button type="button" onClick={goToNextStep}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
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
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer (Accordion mode only) */}
        {viewMode === 'accordion' && (
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
        )}
      </form>
    </FormProvider>
  );
};

export default BotEditPage;
