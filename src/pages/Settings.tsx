import React from 'react';

import AppearanceSettings from '@/components/settings/AppearanceSettings';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your preferences and appearance.</p>
      </div>

      <AppearanceSettings />
    </div>
  );
};

export default Settings;
