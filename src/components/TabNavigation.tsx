import React from 'react';
import { Calendar, MapPin, DollarSign, Package, FileText, Sparkles, Users } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'schedule', label: 'スケジュール', icon: Calendar },
  { id: 'places', label: '観光スポット', icon: MapPin },
  // { id: 'ai-recommendations', label: 'AI提案', icon: Sparkles },
  { id: 'budget', label: '予算', icon: DollarSign },
  { id: 'room-assignment', label: '部屋割り', icon: Users },
  { id: 'packing', label: '持ち物', icon: Package },
  { id: 'notes', label: 'メモ', icon: FileText },
];

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 z-40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;