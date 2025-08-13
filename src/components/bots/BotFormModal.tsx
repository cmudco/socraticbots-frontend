import React, { useCallback, useEffect, useRef } from 'react';

import { FormikProps } from 'formik';
import { Bot, Info } from 'lucide-react';

import { useCreateBot, useUpdateBot } from '@/hooks/queries/useBots';
import { useAuth } from '@/hooks/useAuth';

import { useBotFormStore } from '@/stores/forms/botFormStore';

import { Bot as BotType } from '@/types/bot';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import BotBasicInfoTab from './tabs/BotBasicInfoTab';
import BotPromptsTab from './tabs/BotPromptsTab';
import BotFilesTab from './tabs/BotFilesTab';
import BotDeploymentTab from './tabs/BotDeploymentTab';

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
  const { user } = useAuth();

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
    chatModelDareId,
    trackingModelDareId,
    accessCode,
    setActiveTab,
    closeForm,
    setSubmitting,
    initEditBot,
    initNewBot,
  } = useBotFormStore();

  const createBotMutation = useCreateBot();
  const updateBotMutation = useUpdateBot();

  const isEdit = !!bot;
  const isProfessor = user?.isProfessor ?? false;

  useEffect(() => {
    if (isOpen) {
      if (bot) {
        initEditBot(bot);
      } else {
        initNewBot();
      }
    }
  }, [isOpen, bot, initEditBot, initNewBot]);

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
      const botData = {
        title,
        subject,
        topic,
        accessCode: accessCode || undefined,
      };

      const modelPreferences = {
        chatModelDareId: chatModelDareId || undefined,
        trackingModelDareId: trackingModelDareId || undefined,
      };

      const promptData = {
        greeting: greeting || undefined,
        chatPrompt: chatPrompt || undefined,
        trackingPrompt: trackingPrompt || undefined,
        learningGoals: learningGoals || undefined,
      };

      if (isEdit && bot) {
        await updateBotMutation.mutateAsync({
          botGroupId,
          botId: bot.id,
          botData,
          modelPreferences,
          promptData,
        });
      } else {
        await createBotMutation.mutateAsync({
          botGroupId,
          botData,
          modelPreferences,
          promptData,
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
    accessCode,
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
              <Bot className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {viewOnly ? 'Bot Details' : isEdit ? 'Edit Bot' : 'Create New Bot'}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
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
          <div className="mx-6 mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Info size={20} className="mt-0.5 flex-shrink-0 text-blue-600" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">
                  Additional Features Available After Creation
                </p>
                <p className="mt-1 text-blue-700">
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
            <div className="flex rounded-md bg-slate-100 p-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 rounded-sm px-3 py-2 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-violet-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
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
            <Button onClick={handleClose} className="bg-violet-600 text-white hover:bg-violet-700">
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-violet-600 text-white hover:bg-violet-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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