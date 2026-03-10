/**
 * Student Exam page.
 * Takes the voice exam using the VoiceInterface component.
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ArrowLeft, CheckCircle } from 'lucide-react';

import { useVoiceAgent } from '@/hooks/queries/useVoiceAgents';

import VoiceInterface from '@/components/VoiceExam/VoiceInterface';

import { AgentStatus } from '@/types/voiceAgent';

const StudentExam: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const agentId = parseInt(id || '0');

  const { data: agent, isLoading } = useVoiceAgent(agentId);
  const [isCompleted, setIsCompleted] = useState(false);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);

  // Use permissions from backend access resolver instead of supervisor-only check
  const isStaff = agent?.permissions?.isStaff ?? false;

  const handleComplete = () => {
    setIsCompleted(true);
  };

  const handleAlreadyAttempted = () => {
    setAlreadyAttempted(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-foreground text-2xl font-bold">Exam Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The exam you're looking for doesn't exist or is not available.
          </p>
          <button
            onClick={() => navigate('/voice-exams')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded-lg px-4 py-2"
          >
            Back to Voice Exams
          </button>
        </div>
      </div>
    );
  }

  if (agent.status !== AgentStatus.Active && !isStaff) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-foreground text-2xl font-bold">Exam Not Available</h1>
          <p className="text-muted-foreground mt-2">
            This exam is currently in draft mode and not available for taking.
          </p>
          <button
            onClick={() => navigate('/voice-exams')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded-lg px-4 py-2"
          >
            Back to Voice Exams
          </button>
        </div>
      </div>
    );
  }

  if (alreadyAttempted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="border-border bg-card rounded-lg border p-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-blue-500" />
          <h1 className="text-foreground mb-2 text-2xl font-bold">Exam Already Completed</h1>
          <p className="text-muted-foreground mb-6">
            You have already completed this exam. Only one attempt is allowed per student.
          </p>
          <button
            onClick={() => navigate('/voice-exams')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-2"
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
        <div className="border-border bg-card rounded-lg border p-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="text-foreground mb-2 text-2xl font-bold">Exam Completed!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for completing the exam. Your responses have been recorded.
          </p>
          <div className="flex justify-center gap-4">
            {isStaff && (
              <button
                onClick={() => setIsCompleted(false)}
                className="border-border text-foreground hover:bg-accent rounded-lg border px-6 py-2"
              >
                Take Again
              </button>
            )}
            <button
              onClick={() => navigate('/voice-exams')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-2"
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
          className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agent Details
        </button>
      </div>

      {/* Voice Interface */}
      <VoiceInterface
        agent={agent}
        onComplete={handleComplete}
        onAlreadyAttempted={handleAlreadyAttempted}
      />
    </div>
  );
};

export default StudentExam;
