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
import { ArrowLeft, Bot, Check, Loader2, Save } from 'lucide-react';

import { useBot, useCreateBot, useUpdateBot } from '@/hooks/queries/useBots';
import { useIsCreator } from '@/hooks/queries/useUser';

import { useToastStore } from '@/stores/ui/toastStore';

import BotBasicInfoStep from '@/components/bots/steps/BotBasicInfoStep';
import BotDeploymentStep from '@/components/bots/steps/BotDeploymentStep';
import BotFilesStep from '@/components/bots/steps/BotFilesStep';
import BotPromptsStep from '@/components/bots/steps/BotPromptsStep';
import BotQuickPromptsStep from '@/components/bots/steps/BotQuickPromptsStep';
import BotThemeStep from '@/components/bots/steps/BotThemeStep';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileStepper, Stepper, type StepperStep } from '@/components/ui/stepper';

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

  // Stepper state
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Define steps based on mode and user role
  const steps: StepperStep[] = useMemo(() => {
    const baseSteps: StepperStep[] = [
      { id: 'basic', title: 'Basic Info', description: 'Title, subject, and settings' },
      {
        id: 'prompts',
        title: 'Prompts',
        description: 'Greeting and system prompts',
        optional: true,
      },
      {
        id: 'quick-prompts',
        title: 'Quick Prompts',
        description: 'Shortcut buttons',
        optional: true,
      },
      { id: 'theme', title: 'Theme', description: 'Colors and styling', optional: true },
    ];

    if (isEdit && isCreator) {
      baseSteps.push(
        { id: 'files', title: 'Files', description: 'Knowledge base files', optional: true },
        { id: 'deployment', title: 'Deployment', description: 'Access codes', optional: true }
      );
    }

    return baseSteps;
  }, [isEdit, isCreator]);

  // Load bot data when editing
  useEffect(() => {
    if (isEdit && bot) {
      const formData = mapBotToFormData(bot);
      console.log('[BotEditPage] Bot loaded, resetting form with:', {
        chatModelDareId: formData.chatModelDareId,
        trackingModelDareId: formData.trackingModelDareId,
        title: formData.title,
      });
      form.reset(formData);
    }
  }, [isEdit, bot]); // Removed 'form' from deps - form.reset doesn't need form in deps

  // Validate current step before proceeding
  const validateCurrentStep = async (): Promise<boolean> => {
    if (currentStep === 0) {
      // Validate basic info fields
      const result = await form.trigger(['title', 'subject', 'topic']);
      if (!result) {
        addToast({ message: 'Please fill in all required fields', type: 'error' });
        return false;
      }
    }
    return true;
  };

  // Handle step navigation
  const handleStepClick = async (stepIndex: number) => {
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
      return;
    }

    if (stepIndex > currentStep) {
      const isValid = await validateCurrentStep();
      if (isValid) {
        setCompletedSteps(prev => (prev.includes(currentStep) ? prev : [...prev, currentStep]));
        setCurrentStep(stepIndex);
      }
    }
  };

  const handleNextStep = async () => {
    if (currentStep < steps.length - 1) {
      const isValid = await validateCurrentStep();
      if (isValid) {
        setCompletedSteps(prev => (prev.includes(currentStep) ? prev : [...prev, currentStep]));
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
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
      addToast({ message: 'Failed to save bot. Please try again.', type: 'error' });
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (steps[currentStep]?.id) {
      case 'basic':
        return <BotBasicInfoStep isEdit={isEdit} />;
      case 'prompts':
        return <BotPromptsStep />;
      case 'quick-prompts':
        return <BotQuickPromptsStep />;
      case 'theme':
        return <BotThemeStep />;
      case 'files':
        return <BotFilesStep botGroupId={numericBotGroupId} botId={numericBotId} />;
      case 'deployment':
        return <BotDeploymentStep />;
      default:
        return <BotBasicInfoStep isEdit={isEdit} />;
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

  const isLastStep = currentStep === steps.length - 1;
  const isSubmitting = form.formState.isSubmitting;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="container mx-auto max-w-6xl px-4 py-6"
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

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Desktop Stepper Sidebar */}
          <div className="hidden lg:block">
            <Card className="sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Configuration Steps</CardTitle>
                <CardDescription>Complete each section to set up your bot</CardDescription>
              </CardHeader>
              <CardContent>
                <Stepper
                  steps={steps}
                  currentStep={currentStep}
                  completedSteps={completedSteps}
                  onStepClick={handleStepClick}
                  orientation="vertical"
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex flex-col gap-6">
            {/* Mobile Stepper */}
            <div className="lg:hidden">
              <Card>
                <CardContent className="py-4">
                  <MobileStepper
                    steps={steps}
                    currentStep={currentStep}
                    onStepChange={handleStepClick}
                    completedSteps={completedSteps}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Step Content Card */}
            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStep]?.title}</CardTitle>
                {steps[currentStep]?.description && (
                  <CardDescription>{steps[currentStep].description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>{renderStepContent()}</CardContent>
            </Card>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>

              <div className="flex gap-3">
                {!isLastStep && (
                  <Button type="button" variant="outline" onClick={handleNextStep}>
                    Next Step
                  </Button>
                )}

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {isLastStep ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                      {isEdit ? 'Save Changes' : 'Create Bot'}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default BotEditPage;
