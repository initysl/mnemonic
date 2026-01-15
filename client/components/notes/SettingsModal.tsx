'use client';

import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { CheckCircle2, FileText, Layers, X } from 'lucide-react';
import { useNoteStats } from '@/hooks/useNotes';
import Image from 'next/image';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getInitials(value: string) {
  return value
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user } = useUser();
  const { data, isLoading } = useNoteStats();

  const totalNotes = data?.total_notes ?? 0;
  const displayName = user?.name || user?.nickname || 'Mnemonic User';
  const subtitle =
    user?.email || 'Productive note-taker who values clarity and flow.';

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        onClick={onClose}
        className='absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in'
      />

      <div className='relative w-full max-w-md animate-in zoom-in-95 fade-in duration-200'>
        <button
          onClick={onClose}
          className='absolute -top-12 right-0 rounded-full bg-white/90 p-2 text-neutral-700 shadow-lg hover:bg-white transition'
          aria-label='Close settings'
        >
          <X size={18} />
        </button>

        <div className='rounded-[32px] bg-gradient-to-b from-neutral-50 to-white shadow-[0_30px_80px_rgba(15,23,42,0.15)] p-5'>
          <div className='rounded-[28px] bg-white border border-neutral-200/60 shadow-[0_10px_30px_rgba(15,23,42,0.08)] overflow-hidden'>
            <div className='p-5 pb-0'>
              <div className='relative rounded-[24px] bg-neutral-100 border border-neutral-200 shadow-inner overflow-hidden'>
                {user?.picture ? (
                  <Image
                    src={user.picture}
                    alt={displayName}
                    width={100}
                    height={100}
                    className='h-60 w-full object-cover'
                  />
                ) : (
                  <div className='h-60 w-full bg-gradient-to-br from-orange-100 via-rose-100 to-amber-100 flex items-center justify-center'>
                    <span className='text-4xl font-semibold text-neutral-700'>
                      {getInitials(displayName)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className='px-6 pb-6 pt-5 space-y-3'>
              <div className='flex items-center gap-2'>
                <h2 className='text-xl font-semibold text-neutral-900'>
                  {displayName}
                </h2>
                <CheckCircle2 size={18} className='text-emerald-500' />
              </div>
              <p className='text-sm text-neutral-500'>{subtitle}</p>

              <div className='mt-5 flex items-center justify-between gap-4'>
                <div className='flex items-center gap-5 text-sm text-neutral-600'>
                  <div className='flex items-center gap-2'>
                    <FileText size={16} className='text-neutral-400' />
                    <span className='font-semibold text-neutral-800'>
                      {isLoading ? '—' : totalNotes}
                    </span>
                  </div>
                </div>
                <a
                  href='/auth/logout'
                  className='rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-medium shadow-md hover:bg-neutral-700 transition'
                >
                  Sign out
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
