import React, { useCallback, useEffect, useRef } from 'react';

import { FormikProps } from 'formik';
import { Bot, Info } from 'lucide-react';

import { useBot, useCreateBot, useUpdateBot } from '@/hooks/queries/useBots';
import { useIsProfessor } from '@/hooks/queries/useUser';

import { useBotFormStore } from '@/stores/forms/botFormStore';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Bot as BotType } from '@/types/bot';

import BotBasicInfoTab from './tabs/BotBasicInfoTab';
import BotDeploymentTab from './tabs/BotDeploymentTab';
import BotFilesTab from './tabs/BotFilesTab';
import BotPromptsTab from './tabs/BotPromptsTab';

interface BotFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bot?: BotType | null;
  botGroupId: number;
  viewOnly?: boolean;
}

interface FormValues {
  title: string;
  subject: string;
  topic: string;
  chatModelDareId: number | null;
  trackingModelDareId: number | null;
}

const BotFormModal: React.FC<BotFormModalProps> = ({
  isOpen,
  onClose,
  bot,
  botGroupId,
  viewOnly = false,
}) => {
  const formRef = useRef<FormikProps<FormValues>>(null);
  const isProfessor = useIsProfessor();

  const {
    activeTab,
    isSubmitting,
    title,
    subject,
    topic,
    greeting,
    chatPrompt,
    trackingPrompt,
    learningGoals,
    isAdvanced,
    isActive,
    chatModelDareId,
    trackingModelDareId,
    webSearchEnabled,
    accessCode,
    accessCodeLimit,
    updateAccessCode,
    updateAccessCodeLimit,
    updateAccessCodeUsed,
    setActiveTab,
    closeForm,
    setSubmitting,
    initEditBot,
    initNewBot,
  } = useBotFormStore();

  const createBotMutation = useCreateBot();
  const updateBotMutation = useUpdateBot();

  const isEdit = !!bot;
  const { data: latestBot, refetch: refetchLatestBot } = useBot(
    botGroupId,
    bot?.id || 0,
    isOpen && isEdit
  );
  const hasSyncedAccessRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      if (bot) {
        initEditBot(bot);
      } else {
        initNewBot();
      }
    }
  }, [isOpen, bot, initEditBot, initNewBot]);

  // On modal open (edit), refetch first then sync access code values once
  useEffect(() => {
    if (!isOpen || !isEdit || hasSyncedAccessRef.current) return;

    let cancelled = false;
    (async () => {
      try {
        const result = await refetchLatestBot();
        const botData = result?.data || latestBot;
        if (!cancelled && botData) {
          const serverAccess = botData.accessCode;
          if (serverAccess) {
            if (serverAccess.code) updateAccessCode(serverAccess.code);
            updateAccessCodeLimit(serverAccess.limit ?? 0);
            updateAccessCodeUsed(serverAccess.used ?? 0);
          }
          hasSyncedAccessRef.current = true;
        }
      } catch {
        // Fallback to current latestBot if refetch fails
        if (!cancelled && latestBot) {
          const serverAccess = latestBot.accessCode;
          if (serverAccess) {
            if (serverAccess.code) updateAccessCode(serverAccess.code);
            updateAccessCodeLimit(serverAccess.limit ?? 0);
            updateAccessCodeUsed(serverAccess.used ?? 0);
          }
          hasSyncedAccessRef.current = true;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    isEdit,
    refetchLatestBot,
    latestBot,
    updateAccessCode,
    updateAccessCodeLimit,
    updateAccessCodeUsed,
  ]);

  useEffect(() => {
    if (!isOpen) {
      hasSyncedAccessRef.current = false;
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      closeForm();
      onClose();
    }
  }, [isSubmitting, closeForm, onClose]);

  const handleSubmit = useCallback(async () => {
    if (formRef.current) {
      const errors = await formRef.current.validateForm();
      if (Object.keys(errors).length > 0) {
        formRef.current.setTouched(
          Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      // Build single unified bot data object
      const botFormData = {
        // Basic info
        title,
        subject,
        topic,
        // Access code
        ...(accessCode !== undefined && { accessCode }),
        accessCodeLimit,
        // Model preferences
        ...(chatModelDareId !== undefined && { chatModelDareId }),
        ...(trackingModelDareId !== undefined && { trackingModelDareId }),
        // Prompts
        ...(greeting && { greeting }),
        ...(chatPrompt && { chatPrompt }),
        ...(trackingPrompt && { trackingPrompt }),
        ...(learningGoals && { learningGoals }),
        isAdvanced,
        isActive,
        webSearchEnabled,
      };

      if (isEdit && bot) {
        await updateBotMutation.mutateAsync({
          botGroupId,
          botId: bot.id,
          botData: botFormData,
        });
      } else {
        await createBotMutation.mutateAsync({
          botGroupId,
          botData: botFormData,
        });
      }

      closeForm();
      onClose();
    } catch (error) {
      console.error('Error saving bot:', error);
    } finally {
      setSubmitting(false);
    }
  }, [
    title,
    subject,
    topic,
    greeting,
    chatPrompt,
    trackingPrompt,
    learningGoals,
    chatModelDareId,
    trackingModelDareId,
    isAdvanced,
    isActive,
    webSearchEnabled,
    accessCode,
    accessCodeLimit,
    isEdit,
    bot,
    updateBotMutation,
    createBotMutation,
    botGroupId,
    closeForm,
    onClose,
    setSubmitting,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleSubmit]);

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'prompts', label: 'Prompts' },
    ...(isEdit && isProfessor ? [{ id: 'files', label: 'Files' }] : []),
    ...(isEdit && isProfessor ? [{ id: 'deployment', label: 'Deployment' }] : []),
  ];

  useEffect(() => {
    if ((!isEdit || !isProfessor) && (activeTab === 'files' || activeTab === 'deployment')) {
      setActiveTab('basic');
    }
  }, [isEdit, isProfessor, activeTab, setActiveTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BotBasicInfoTab ref={formRef} viewOnly={viewOnly} />;
      case 'prompts':
        return <BotPromptsTab viewOnly={viewOnly} />;
      case 'files':
        return <BotFilesTab botGroupId={botGroupId} botId={bot?.id || 0} />;
      case 'deployment':
        return <BotDeploymentTab botGroupId={botGroupId} botId={bot?.id || 0} />;
      default:
        return <BotBasicInfoTab ref={formRef} viewOnly={viewOnly} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <Bot className="text-primary h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {viewOnly ? 'Bot Details' : isEdit ? 'Edit Bot' : 'Create New Bot'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {viewOnly
                  ? 'View bot information below.'
                  : isEdit
                    ? 'Update the bot details below.'
                    : 'Fill in the details to create a new bot.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!isEdit && (
          <div className="border-primary/20 bg-primary/5 mx-6 mt-4 rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-foreground font-medium">
                  Additional Features Available After Creation
                </p>
                <p className="text-muted-foreground mt-1">
                  Once your bot is created,{' '}
                  {isProfessor
                    ? "you'll be able to upload files and generate deployment codes in the Files and Deployment tabs when editing the bot."
                    : 'professors will be able to upload files and manage deployment settings in additional tabs when editing the bot.'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-shrink-0 border-b px-6">
            <div className="bg-muted flex rounded-md p-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 rounded-sm px-3 py-2 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-background text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">{renderTabContent()}</div>
        </div>

        <DialogFooter className="flex items-center justify-end space-x-3 border-t p-6">
          {viewOnly ? (
            <Button onClick={handleClose}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </div>
                ) : isEdit ? (
                  'Update Bot'
                ) : (
                  'Create Bot'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BotFormModal;
