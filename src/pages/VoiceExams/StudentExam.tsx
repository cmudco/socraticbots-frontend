/**
 * Student Exam page.
 * Takes the voice exam using the VoiceInterface component.
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ArrowLeft, CheckCircle } from 'lucide-react';

import { useVoiceAgent } from '@/hooks/queries/useVoiceAgents';

import VoiceInterface from '@/components/VoiceExam/VoiceInterface';

const StudentExam: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const agentId = parseInt(id || '0');

  const { data: agent, isLoading } = useVoiceAgent(agentId);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Not Found</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The exam you're looking for doesn't exist or is not available.
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

  if (agent.status !== 'active') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Not Available</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            This exam is currently in draft mode and not available for taking.
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

  if (isCompleted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Exam Completed!</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Thank you for completing the exam. Your responses have been recorded.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsCompleted(false)}
              className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Take Again
            </button>
            <button
              onClick={() => navigate('/voice-exams')}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Back to Voice Exams
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/voice-exams/${agent.id}`)}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agent Details
        </button>
      </div>

      {/* Voice Interface */}
      <VoiceInterface agent={agent} onComplete={handleComplete} />
    </div>
  );
};

export default StudentExam;
