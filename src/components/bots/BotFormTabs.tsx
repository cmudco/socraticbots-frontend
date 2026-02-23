import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface BotFormTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const BotFormTabs: React.FC<BotFormTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex-shrink-0 border-b px-6">
      <div className="bg-muted flex rounded-md p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 rounded-sm px-3 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BotFormTabs;
