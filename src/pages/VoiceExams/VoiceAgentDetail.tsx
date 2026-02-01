/**
 * Voice Agent Detail page.
 * View and edit voice agent configuration.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ArrowLeft, Clock, Edit2, MessageSquare, Play, Save, Trash2, X } from 'lucide-react';

import { useUser } from '@/hooks/queries/useUser';
import {
  useDeleteVoiceAgent,
  useUpdateVoiceAgent,
  useVoiceAgent,
} from '@/hooks/queries/useVoiceAgents';

import { VoiceAgentUpdateData } from '@/types/voiceAgent';

interface AdvancedSettings {
  turnEagerness: 'low' | 'normal' | 'high';
  turnTimeout: number;
  spellingPatience: 'auto' | 'low' | 'normal' | 'high';
  ttsStability: number;
  ttsSpeed: number;
  ttsSimilarityBoost: number;
  llmModel: string;
}

const VoiceAgentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const agentId = parseInt(id || '0');

  const user = useUser();
  const { data: agent, isLoading } = useVoiceAgent(agentId);
  const updateAgent = useUpdateVoiceAgent();
  const deleteAgent = useDeleteVoiceAgent();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<VoiceAgentUpdateData>({});
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    turnEagerness: 'normal',
    turnTimeout: 7,
    spellingPatience: 'auto',
    ttsStability: 0.5,
    ttsSpeed: 1.0,
    ttsSimilarityBoost: 0.75,
    llmModel: '',
  });

  const isOwner = user?.id === agent?.user;
  const isCreator = user?.isCreator ?? false;
  const canEdit = isOwner && isCreator;
  const canTakeExam = agent?.status === 'active' || isOwner;

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        description: agent.description,
        systemPrompt: agent.systemPrompt,
        firstMessage: agent.firstMessage,
        voiceId: agent.voiceId,
        temperature: agent.temperature,
        maxDurationSeconds: agent.maxDurationSeconds,
        examTitle: agent.examTitle,
        examInstructions: agent.examInstructions,
        status: agent.status,
      });

      // Load advanced settings from conversationConfig
      const config = agent.conversationConfig;
      if (config) {
        setAdvancedSettings({
          turnEagerness: config.turn?.turnEagerness ?? 'normal',
          turnTimeout: config.turn?.turnTimeout ?? 7,
          spellingPatience: config.turn?.spellingPatience ?? 'auto',
          ttsStability: config.tts?.stability ?? 0.5,
          ttsSpeed: config.tts?.speed ?? 1.0,
          ttsSimilarityBoost: config.tts?.similarityBoost ?? 0.75,
          llmModel: config.agent?.prompt?.llm ?? '',
        });
      }
    }
  }, [agent]);

  const handleSave = async () => {
    if (!agent) return;

    // Build conversationConfig from advanced settings (matching DARE structure)
    const conversationConfig = {
      turn: {
        turnEagerness: advancedSettings.turnEagerness,
        turnTimeout: advancedSettings.turnTimeout,
        spellingPatience: advancedSettings.spellingPatience,
      },
      tts: {
        voiceId: formData.voiceId,
        stability: advancedSettings.ttsStability,
        speed: advancedSettings.ttsSpeed,
        similarityBoost: advancedSettings.ttsSimilarityBoost,
      },
      agent: {
        prompt: {
          prompt: formData.systemPrompt,
          temperature: formData.temperature,
          ...(advancedSettings.llmModel && { llm: advancedSettings.llmModel }),
        },
        firstMessage: formData.firstMessage,
      },
      conversation: {
        maxDurationSeconds: formData.maxDurationSeconds,
      },
    };

    const updateData: VoiceAgentUpdateData = {
      ...formData,
      conversationConfig,
    };

    const result = await updateAgent.mutateAsync({ id: agent.id, data: updateData });
    if (result) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!agent) return;
    const success = await deleteAgent.mutateAsync(agent.id);
    if (success !== undefined) {
      navigate('/voice-exams');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Not Found</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The voice agent you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate('/voice-exams')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Back to Voice Exams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/voice-exams')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Voice Exams
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{agent.name}</h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  agent.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {agent.status}
              </span>
            </div>
            {agent.examTitle && (
              <p className="mt-1 text-lg text-gray-700 dark:text-gray-300">{agent.examTitle}</p>
            )}
          </div>
          <div className="flex gap-2">
            {canTakeExam && (
              <button
                onClick={() => navigate(`/voice-exams/${agent.id}/exam`)}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                <Play className="h-4 w-4" />
                Take Exam
              </button>
            )}
            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Conversations</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {agent.conversationCount}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Max Duration</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {Math.floor(agent.maxDurationSeconds / 60)} min
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(agent.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <form className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name ?? ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description ?? ''}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status ?? 'draft'}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
          </div>

          {/* Exam Config */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Exam Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Exam Title
                </label>
                <input
                  type="text"
                  name="examTitle"
                  value={formData.examTitle ?? ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Exam Instructions
                </label>
                <textarea
                  name="examInstructions"
                  value={formData.examInstructions ?? ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* AI Config */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              AI Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  System Prompt
                </label>
                <textarea
                  name="systemPrompt"
                  value={formData.systemPrompt ?? ''}
                  onChange={handleChange}
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Message
                </label>
                <textarea
                  name="firstMessage"
                  value={formData.firstMessage ?? ''}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Temperature ({formData.temperature ?? 0.7})
                </label>
                <input
                  type="range"
                  name="temperature"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature ?? 0.7}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Duration (seconds)
                </label>
                <input
                  type="number"
                  name="maxDurationSeconds"
                  value={formData.maxDurationSeconds ?? 1800}
                  onChange={handleChange}
                  min={60}
                  max={7200}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Advanced ElevenLabs Settings */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Advanced ElevenLabs Settings
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Fine-tune conversation behavior, voice output, and LLM settings
            </p>

            {/* Turn Settings */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Turn Settings
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                    Eagerness
                  </label>
                  <select
                    value={advancedSettings.turnEagerness}
                    onChange={e =>
                      setAdvancedSettings(prev => ({
                        ...prev,
                        turnEagerness: e.target.value as 'low' | 'normal' | 'high',
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">How quickly the agent responds</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                    Turn Timeout ({advancedSettings.turnTimeout}s)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={advancedSettings.turnTimeout}
                    onChange={e =>
                      setAdvancedSettings(prev => ({
                        ...prev,
                        turnTimeout: parseInt(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">Seconds before timeout</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                    Spelling Patience
                  </label>
                  <select
                    value={advancedSettings.spellingPatience}
                    onChange={e =>
                      setAdvancedSettings(prev => ({
                        ...prev,
                        spellingPatience: e.target.value as 'auto' | 'low' | 'normal' | 'high',
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="auto">Auto</option>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Patience for spelling out words</p>
                </div>
              </div>
            </div>

            {/* TTS Settings */}
            <div className="mb-6 border-t border-gray-200 pt-4 dark:border-gray-700">
              <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Voice Settings (TTS)
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                    Stability ({advancedSettings.ttsStability})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={advancedSettings.ttsStability}
                    onChange={e =>
                      setAdvancedSettings(prev => ({
                        ...prev,
                        ttsStability: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">Higher = more consistent voice</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                    Speed ({advancedSettings.ttsSpeed}x)
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={advancedSettings.ttsSpeed}
                    onChange={e =>
                      setAdvancedSettings(prev => ({
                        ...prev,
                        ttsSpeed: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">Speech speed multiplier</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                    Similarity ({advancedSettings.ttsSimilarityBoost})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={advancedSettings.ttsSimilarityBoost}
                    onChange={e =>
                      setAdvancedSettings(prev => ({
                        ...prev,
                        ttsSimilarityBoost: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">Voice similarity boost</p>
                </div>
              </div>
            </div>

            {/* LLM Settings */}
            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
              <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                LLM Settings
              </h3>
              <div>
                <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                  LLM Model (optional)
                </label>
                <input
                  type="text"
                  value={advancedSettings.llmModel}
                  onChange={e =>
                    setAdvancedSettings(prev => ({
                      ...prev,
                      llmModel: e.target.value,
                    }))
                  }
                  placeholder="Leave empty for default"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500">e.g., gpt-4o, claude-3-5-sonnet</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete Agent
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={updateAgent.isPending}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {updateAgent.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Description */}
          {agent.description && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Description
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{agent.description}</p>
            </div>
          )}

          {/* Exam Instructions */}
          {agent.examInstructions && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Exam Instructions
              </h2>
              <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                {agent.examInstructions}
              </p>
            </div>
          )}

          {/* System Prompt (Owners only) */}
          {isOwner && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                System Prompt
              </h2>
              <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                {agent.systemPrompt}
              </p>
            </div>
          )}

          {/* First Message */}
          {agent.firstMessage && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                First Message
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{agent.firstMessage}</p>
            </div>
          )}

          {/* Configuration Details (Owners only) */}
          {isOwner && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Configuration
              </h2>
              <dl className="grid gap-4 md:grid-cols-2">
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Temperature</dt>
                  <dd className="text-gray-900 dark:text-white">{agent.temperature}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Voice ID</dt>
                  <dd className="text-gray-900 dark:text-white">{agent.voiceId || 'Default'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">ElevenLabs Agent ID</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {agent.elevenlabsAgentId || 'Not configured'}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Advanced ElevenLabs Settings (Owners only) */}
          {isOwner && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Advanced ElevenLabs Settings
              </h2>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Fine-tune conversation behavior, voice output, and LLM settings
              </p>
              <dl className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Turn Settings */}
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Eagerness</dt>
                  <dd className="text-gray-900 capitalize dark:text-white">
                    {agent.conversationConfig?.turn?.turnEagerness || 'normal'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Turn Timeout</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {agent.conversationConfig?.turn?.turnTimeout || 7}s
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Spelling Patience</dt>
                  <dd className="text-gray-900 capitalize dark:text-white">
                    {agent.conversationConfig?.turn?.spellingPatience || 'auto'}
                  </dd>
                </div>

                {/* TTS Settings */}
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Stability</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {agent.conversationConfig?.tts?.stability ?? 0.5}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Speed</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {agent.conversationConfig?.tts?.speed ?? 1.0}x
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Similarity Boost</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {agent.conversationConfig?.tts?.similarityBoost ?? 0.75}
                  </dd>
                </div>

                {/* LLM Settings */}
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">LLM Model</dt>
                  <dd className="font-mono text-sm text-gray-900 dark:text-white">
                    {agent.conversationConfig?.agent?.prompt?.llm || 'default'}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Delete Voice Agent?
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              This will permanently delete "{agent.name}" and all associated data. This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteAgent.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteAgent.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAgentDetail;
