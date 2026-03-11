/**
 * StudentAttemptsPanel — displays students who have accessed an exam
 * and allows managers to grant additional attempts.
 */
import React, { useState } from 'react';

import { CheckCircle, Loader2, RefreshCw, RotateCcw } from 'lucide-react';

import { useGrantRetake, useStudentAttempts } from '@/hooks/queries/useVoiceAgents';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface StudentAttemptsPanelProps {
  agentId: number;
}

const StudentAttemptsPanel: React.FC<StudentAttemptsPanelProps> = ({ agentId }) => {
  const { data: students, isLoading, refetch, isFetching } = useStudentAttempts(agentId);
  const grantRetake = useGrantRetake();

  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [customAttempts, setCustomAttempts] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearFeedback = () => {
    setError('');
    setSuccess('');
  };

  const handleQuickRetake = async (email: string, currentMax: number) => {
    clearFeedback();
    try {
      await grantRetake.mutateAsync({
        agentId,
        email,
        maxAttempts: currentMax + 1,
      });
      setSuccess(`Granted 1 additional attempt to ${email}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to grant retake';
      setError(msg);
    }
  };

  const handleCustomAttempts = async (email: string) => {
    const value = parseInt(customAttempts);
    if (!value || value < 1) {
      setError('Please enter a valid number (1 or more)');
      return;
    }
    clearFeedback();
    try {
      await grantRetake.mutateAsync({
        agentId,
        email,
        maxAttempts: value,
      });
      setSuccess(`Set max attempts to ${value} for ${email}`);
      setEditingEmail(null);
      setCustomAttempts('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update attempts';
      setError(msg);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, email: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomAttempts(email);
    }
    if (e.key === 'Escape') {
      setEditingEmail(null);
      setCustomAttempts('');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Student Attempts
            </CardTitle>
            <CardDescription>
              View student exam attempts and grant retakes to selected students.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-1 h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Feedback messages */}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}

        {!students || students.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No students have redeemed access to this exam yet.
          </p>
        ) : (
          <div className="space-y-2">
            {students.map(student => (
              <div
                key={student.userId}
                className="border-border flex items-center justify-between rounded-lg border px-3 py-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-foreground text-sm">{student.email}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      {student.attemptsUsed} / {student.maxAttempts} attempt
                      {student.maxAttempts !== 1 ? 's' : ''} used
                    </span>
                    {student.attemptsUsed > 0 && student.canRetake ? (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        can retake
                      </span>
                    ) : student.attemptsUsed > 0 && !student.canRetake ? (
                      <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        completed
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {editingEmail === student.email ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={1}
                        placeholder="Max"
                        value={customAttempts}
                        onChange={e => setCustomAttempts(e.target.value)}
                        onKeyDown={e => handleKeyDown(e, student.email)}
                        className="w-20 text-center"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleCustomAttempts(student.email)}
                        disabled={grantRetake.isPending}
                      >
                        Set
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingEmail(null);
                          setCustomAttempts('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickRetake(student.email, student.maxAttempts)}
                        disabled={grantRetake.isPending}
                        title="Grant one additional attempt"
                      >
                        {grantRetake.isPending ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <RotateCcw className="mr-1 h-3 w-3" />
                        )}
                        +1 Attempt
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          clearFeedback();
                          setEditingEmail(student.email);
                          setCustomAttempts(String(student.maxAttempts));
                        }}
                        title="Set custom number of attempts"
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentAttemptsPanel;
