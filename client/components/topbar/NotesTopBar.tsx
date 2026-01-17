'use client';

import { Settings, Plus, LayoutGrid, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Image from 'next/image';
import { useTheme } from 'next-themes';

interface NotesTopBarProps {
  onCreateClick: () => void;
  onSettingsClick?: () => void;
  isModalOpen?: boolean;
}

export default function NotesTopBar({
  onCreateClick,
  onSettingsClick,
  isModalOpen = false,
}: NotesTopBarProps) {
  const { user } = useUser();
  const { resolvedTheme, setTheme } = useTheme();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>('All');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      href: onSettingsClick ? undefined : '/dashboard/settings',
      onClick: onSettingsClick,
    },
  ];

  return (
    <div className='flex items-center gap-3'>
      <div className='flex-1 flex items-center justify-start'>
        {user && (
          <div className='flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300'>
            <Image
              src={user.picture ?? `ui-avatars.com{user.name}`}
              alt='user profile picture'
              width={32}
              height={32}
              className='rounded-full shadow-sm'
            />
            <div className='hidden sm:inline'>
              <span>{user.name}</span>
            </div>
          </div>
        )}
      </div>
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
                    <span className='hidden sm:inline text-sm font-medium whitespace-nowrap'>
                      {item.name}
                    </span>
                  )}
                </>
              );

              const baseClasses =
                'relative flex items-center gap-2 transition-all duration-100 rounded-xl';
              const activeClasses = showActive
                ? 'bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 shadow-md scale-105'
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
      <div className='flex-1 flex items-center justify-end'>
        <button
          type='button'
          aria-label='Toggle theme'
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className='flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800'
        >
          {mounted && resolvedTheme === 'dark' ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
