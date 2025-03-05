'use client';

import { useState } from 'react';
import { Users, Radio, Grid, List, Tag } from 'lucide-react';
import UsersSection from './sections/UsersSection';
import StationsSection from './sections/StationsSection';
import CategoriesSection from './sections/CategoriesSection';
import SequenceSection from './sections/SequenceSection';
import FormatsSection from './sections/FormatsSection';

type SettingsTab = 'users' | 'stations' | 'categories' | 'sequence' | 'formats';

export function SettingsLayout() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('users');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`
              py-4 px-1 inline-flex items-center gap-2
              border-b-2 font-medium text-sm
              ${activeTab === 'users'
                ? 'border-[#7ac5be] text-[#7ac5be]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Users className="h-5 w-5" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('stations')}
            className={`
              py-4 px-1 inline-flex items-center gap-2
              border-b-2 font-medium text-sm
              ${activeTab === 'stations'
                ? 'border-[#7ac5be] text-[#7ac5be]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Radio className="h-5 w-5" />
            Stations
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`
              py-4 px-1 inline-flex items-center gap-2
              border-b-2 font-medium text-sm
              ${activeTab === 'categories'
                ? 'border-[#7ac5be] text-[#7ac5be]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Grid className="h-5 w-5" />
            Categories
          </button>
          <button
            onClick={() => setActiveTab('sequence')}
            className={`
              py-4 px-1 inline-flex items-center gap-2
              border-b-2 font-medium text-sm
              ${activeTab === 'sequence'
                ? 'border-[#7ac5be] text-[#7ac5be]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <List className="h-5 w-5" />
            Sequence
          </button>
          <button
            onClick={() => setActiveTab('formats')}
            className={`
              py-4 px-1 inline-flex items-center gap-2
              border-b-2 font-medium text-sm
              ${activeTab === 'formats'
                ? 'border-[#7ac5be] text-[#7ac5be]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Tag className="h-5 w-5" />
            Formats
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {activeTab === 'users' && <UsersSection />}
        {activeTab === 'stations' && <StationsSection />}
        {activeTab === 'categories' && <CategoriesSection />}
        {activeTab === 'sequence' && <SequenceSection />}
        {activeTab === 'formats' && <FormatsSection />}
      </div>
    </div>
  );
} 