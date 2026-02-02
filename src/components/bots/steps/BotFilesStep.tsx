import React from 'react';

// BotFilesStep is a wrapper around the existing BotFilesTab
// The files functionality is complex and doesn't interact with the form state
// (files are managed via separate API calls, not form submission)
// So we keep the existing implementation and wrap it

import BotFilesTab from '@/components/bots/tabs/BotFilesTab';

interface BotFilesStepProps {
  botGroupId: number;
  botId: number;
}

const BotFilesStep: React.FC<BotFilesStepProps> = ({ botGroupId, botId }) => {
  return <BotFilesTab botGroupId={botGroupId} botId={botId} />;
};

export default BotFilesStep;
