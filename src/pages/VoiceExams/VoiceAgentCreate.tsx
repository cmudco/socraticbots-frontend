/**
 * Create Voice Agent page.
 * Form for creating a new ElevenLabs voice agent.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowLeft, ChevronDown, ChevronUp, Save } from 'lucide-react';

import { useUser } from '@/hooks/queries/useUser';
import { useCreateVoiceAgent } from '@/hooks/queries/useVoiceAgents';

import { ConversationConfig, VoiceAgentCreateData } from '@/types/voiceAgent';

const VoiceAgentCreate: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser();
  const createAgent = useCreateVoiceAgent();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState<VoiceAgentCreateData>({
    name: '',
    description: '',
    systemPrompt: '',
    firstMessage: '',
    voiceId: '',
    temperature: 0.7,
    maxDurationSeconds: 1800,
    examTitle: '',
    examInstructions: '',
    status: 'draft',
    conversationConfig: {},
  });

  const [advancedConfig, setAdvancedConfig] = useState<ConversationConfig>({
    turn: {
      turnTimeout: 7,
      silenceEndCallTimeout: undefined,
      turnEagerness: 'normal',
      spellingPatience: 'auto',
    },
    tts: {
      stability: 0.5,
      speed: 1.0,
      similarityBoost: 0.75,
    },
    agent: {
      prompt: {
        llm: '',
      },
    },
  });

  // Redirect if not a creator
  useEffect(() => {
    if (user && !user.isCreator) {
      navigate('/voice-exams');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build conversationConfig from advancedConfig (matching DARE structure)
    const conversationConfig = showAdvanced
      ? {
          turn: {
            turnEagerness: advancedConfig.turn?.turnEagerness,
            turnTimeout: advancedConfig.turn?.turnTimeout,
            spellingPatience: advancedConfig.turn?.spellingPatience,
          },
          tts: {
            voiceId: formData.voiceId,
            stability: advancedConfig.tts?.stability,
            speed: advancedConfig.tts?.speed,
            similarityBoost: advancedConfig.tts?.similarityBoost,
          },
          agent: {
            prompt: {
              prompt: formData.systemPrompt,
              temperature: formData.temperature,
              ...(advancedConfig.agent?.prompt?.llm && {
                llm: advancedConfig.agent.prompt.llm,
              }),
            },
            firstMessage: formData.firstMessage,
          },
          conversation: {
            maxDurationSeconds: formData.maxDurationSeconds,
          },
        }
      : undefined;

    const data: VoiceAgentCreateData = {
      ...formData,
      conversationConfig,
    };

    const result = await createAgent.mutateAsync(data);
    if (result) {
      navigate(`/voice-exams/${result.id}`);
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

  if (!user?.isCreator) {
    return null;
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Voice Agent</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Configure a new ElevenLabs voice agent for exams
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Agent Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Philosophy Exam Agent"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Brief description of what this agent does"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Only active agents are visible to all users
              </p>
            </div>
          </div>
        </div>

        {/* Exam Configuration */}
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
                value={formData.examTitle}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Introduction to Philosophy - Midterm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Exam Instructions
              </label>
              <textarea
                name="examInstructions"
                value={formData.examInstructions}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Instructions shown to students before the exam begins"
              />
            </div>
          </div>
        </div>

        {/* AI Configuration */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            AI Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                System Prompt *
              </label>
              <textarea
                name="systemPrompt"
                value={formData.systemPrompt}
                onChange={handleChange}
                required
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="You are an examiner conducting an oral exam on philosophy. Ask questions about the student's understanding of key concepts..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Instructions for the AI agent behavior during the exam
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Message
              </label>
              <textarea
                name="firstMessage"
                value={formData.firstMessage}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Hello! I'll be conducting your exam today. Are you ready to begin?"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Temperature ({formData.temperature})
              </label>
              <input
                type="range"
                name="temperature"
                min="0"
                max="2"
                step="0.1"
                value={formData.temperature}
                onChange={handleChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Focused</span>
                <span>Creative</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Max Duration (seconds)
              </label>
              <input
                type="number"
                name="maxDurationSeconds"
                value={formData.maxDurationSeconds}
                onChange={handleChange}
                min={60}
                max={7200}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500">
                Maximum conversation duration (60-7200 seconds)
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Settings (Collapsible) */}
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center justify-between p-6 text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Advanced Settings
            </h2>
            {showAdvanced ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {showAdvanced && (
            <div className="border-t border-gray-200 p-6 dark:border-gray-700">
              <div className="space-y-6">
                {/* Turn Settings */}
                <div>
                  <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Turn Settings
                  </h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                        Eagerness
                      </label>
                      <select
                        value={advancedConfig.turn?.turnEagerness ?? 'normal'}
                        onChange={e =>
                          setAdvancedConfig(prev => ({
                            ...prev,
                            turn: {
                              ...prev.turn,
                              turnEagerness: e.target.value as 'low' | 'normal' | 'high',
                            },
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
                        Turn Timeout ({advancedConfig.turn?.turnTimeout ?? 7}s)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={advancedConfig.turn?.turnTimeout ?? 7}
                        onChange={e =>
                          setAdvancedConfig(prev => ({
                            ...prev,
                            turn: {
                              ...prev.turn,
                              turnTimeout: parseInt(e.target.value),
                            },
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
                        value={advancedConfig.turn?.spellingPatience ?? 'auto'}
                        onChange={e =>
                          setAdvancedConfig(prev => ({
                            ...prev,
                            turn: {
                              ...prev.turn,
                              spellingPatience: e.target.value as
                                | 'auto'
                                | 'low'
                                | 'normal'
                                | 'high',
                            },
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
                <div>
                  <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Voice Settings (TTS)
                  </h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                        Stability ({advancedConfig.tts?.stability ?? 0.5})
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={advancedConfig.tts?.stability ?? 0.5}
                        onChange={e =>
                          setAdvancedConfig(prev => ({
                            ...prev,
                            tts: { ...prev.tts, stability: parseFloat(e.target.value) },
                          }))
                        }
                        className="w-full"
                      />
                      <p className="mt-1 text-xs text-gray-500">Higher = more consistent voice</p>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                        Speed ({advancedConfig.tts?.speed ?? 1.0}x)
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={advancedConfig.tts?.speed ?? 1.0}
                        onChange={e =>
                          setAdvancedConfig(prev => ({
                            ...prev,
                            tts: { ...prev.tts, speed: parseFloat(e.target.value) },
                          }))
                        }
                        className="w-full"
                      />
                      <p className="mt-1 text-xs text-gray-500">Speech speed multiplier</p>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                        Similarity ({advancedConfig.tts?.similarityBoost ?? 0.75})
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={advancedConfig.tts?.similarityBoost ?? 0.75}
                        onChange={e =>
                          setAdvancedConfig(prev => ({
                            ...prev,
                            tts: { ...prev.tts, similarityBoost: parseFloat(e.target.value) },
                          }))
                        }
                        className="w-full"
                      />
                      <p className="mt-1 text-xs text-gray-500">Voice similarity boost</p>
                    </div>
                  </div>
                </div>

                {/* LLM Settings */}
                <div>
                  <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    LLM Settings
                  </h3>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                      LLM Model (optional)
                    </label>
                    <input
                      type="text"
                      value={advancedConfig.agent?.prompt?.llm ?? ''}
                      onChange={e =>
                        setAdvancedConfig(prev => ({
                          ...prev,
                          agent: {
                            ...prev.agent,
                            prompt: { ...prev.agent?.prompt, llm: e.target.value },
                          },
                        }))
                      }
                      placeholder="Leave empty for default"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500">e.g., gpt-4o, claude-3-5-sonnet</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/voice-exams')}
            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createAgent.isPending}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {createAgent.isPending ? 'Creating...' : 'Create Agent'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VoiceAgentCreate;
