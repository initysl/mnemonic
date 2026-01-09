'use client';

import { User, Settings, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const categories = ['All', 'Projects', 'Meeting', 'Design'];

interface NotesTopBarProps {
  onCreateClick: () => void;
}

export default function NotesTopBar({ onCreateClick }: NotesTopBarProps) {
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <div className='flex items-center justify-between pb-4'>
      {/* Left: User Profile */}
      <div className='flex items-center gap-3'>
        <div className='w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center'>
          <User size={20} className='text-white' />
        </div>
        <span className='hidden sm:block font-semibold text-neutral-900 dark:text-neutral-100'>
          Your Notes
        </span>
      </div>

      {/* Center: Category Pills */}
      <div className='hidden md:flex items-center gap-2'>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {category}
          </button>
        ))}
        <button
          onClick={onCreateClick}
          className='p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors'
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Right: Settings */}
      <Link
        href='/dashboard/settings'
        className='flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors'
      >
        <Settings size={18} />
        <span className='hidden sm:inline text-sm font-medium'>Settings</span>
      </Link>
    </div>
  );
}
