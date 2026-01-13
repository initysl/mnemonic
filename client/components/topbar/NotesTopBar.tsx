'use client';

import { Settings, Plus, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface NotesTopBarProps {
  onCreateClick: () => void;
  isModalOpen?: boolean;
}

export default function NotesTopBar({
  onCreateClick,
  isModalOpen = false,
}: NotesTopBarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>('All');

  // Reset to 'All' when modal closes
  useEffect(() => {
    if (!isModalOpen && activeView === 'Create') {
      setActiveView('All');
    }
  }, [isModalOpen, activeView]);

  const actions = [
    {
      name: 'All',
      icon: LayoutGrid,
      onClick: () => setActiveView('All'),
    },
    {
      name: 'Create',
      icon: Plus,
      onClick: () => {
        setActiveView('Create');
        onCreateClick();
      },
    },
    {
      name: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
    },
  ];

  return (
    <div className='flex items-center justify-center'>
      <div className='bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded-2xl shadow-lg'>
        <ul className='flex items-center gap-2'>
          {actions.map((item) => {
            const isHovered = hoveredItem === item.name;
            const isActive = activeView === item.name;
            const showActive = isActive || isHovered;

            const buttonContent = (
              <>
                <item.icon size={20} className='shrink-0' />
                {showActive && (
                  <span className='text-sm font-medium whitespace-nowrap'>
                    {item.name}
                  </span>
                )}
              </>
            );

            const baseClasses =
              'relative flex items-center gap-2 transition-all duration-100 rounded-xl';
            const activeClasses = showActive
              ? 'bg-blue-600 text-white px-4 py-2 shadow-md scale-105'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 p-2';

            return (
              <li key={item.name}>
                {item.href ? (
                  <Link
                    href={item.href}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`${baseClasses} ${activeClasses}`}
                    aria-label={item.name}
                  >
                    {buttonContent}
                  </Link>
                ) : (
                  <button
                    onClick={item.onClick}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`${baseClasses} ${activeClasses}`}
                    aria-label={item.name}
                  >
                    {buttonContent}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
