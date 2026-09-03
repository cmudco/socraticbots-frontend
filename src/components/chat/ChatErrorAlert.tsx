import React from 'react';

import { AlertCircle, X } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ChatErrorAlertProps {
  message: string;
  onDismiss: () => void;
}

const ChatErrorAlert: React.FC<ChatErrorAlertProps> = ({ message, onDismiss }) => (
  <div className="bg-background px-4 pt-3">
    <Alert variant="destructive" className="pr-11">
      <AlertCircle />
      <AlertTitle>Message could not be sent</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      <button
        type="button"
        onClick={onDismiss}
        className="hover:bg-destructive/10 absolute top-2.5 right-2.5 rounded-md p-1 transition-colors"
        aria-label="Dismiss error"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  </div>
);

export default ChatErrorAlert;
