'use client';

import { Plus, Settings } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const TABS = ['All', 'Projects'];

export default function NotesTopBar() {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <div className='flex items-center justify-between rounded-2xl bg-white px-6 py-3 shadow-sm'>
      {/* Left: User */}
      <div className='flex items-center gap-3'>
        <div className='h-9 w-9 rounded-full bg-neutral-300' />
        <span className='text-sm font-medium text-neutral-900 hidden sm:block'>
          Mahid Ahmed
        </span>
      </div>

      {/* Center: Tabs */}
      <div className='flex items-center gap-2 rounded-full bg-neutral-100 p-1'>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'rounded-full px-4 py-1.5 text-sm font-medium transition',
              activeTab === tab
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            {tab}
          </button>
        ))}

        {/* Add button */}
        <button className='ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-600 hover:bg-neutral-200'>
          <Plus size={16} />
        </button>
      </div>

      {/* Right: Settings */}
      <button className='flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-200'>
        <Settings size={16} />
      </button>
    </div>
  );
}
