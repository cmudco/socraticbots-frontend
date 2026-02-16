import React from 'react';

import { CheckCircle } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

const AccessManagementInfo: React.FC = () => {
  return (
    <Card className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 mt-8">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <CheckCircle className="text-primary mt-0.5 h-5 w-5" />
          <div>
            <h3 className="text-primary text-sm font-medium">Access Management Information</h3>
            <div className="text-muted-foreground mt-2 space-y-1 text-sm">
              <p>
                • <strong>Direct Bot Access:</strong> Users who redeemed a specific subscription
                code for this bot
              </p>
              <p>
                • <strong>Bot Group Access:</strong> Users who redeemed a subscription code for the
                entire bot group
              </p>
              <p>
                • <strong>Bot Group Owner:</strong> The creator of the bot group (has access to all
                bots)
              </p>
              <p>
                • <strong>Bot Group Collaborator:</strong> Users invited to collaborate on the bot
                group
              </p>
              <p>
                • <strong>Bot Creator:</strong> The user who created this specific bot
              </p>
              <p>• Removing access will prevent the user from accessing this bot</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessManagementInfo;
