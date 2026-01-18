'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { CheckCircle2, FileText, X } from 'lucide-react';
import { useDeleteAllNotes, useNoteStats } from '@/hooks/useNotes';
import Image from 'next/image';
import { toast } from 'sonner';

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
  const deleteAllNotes = useDeleteAllNotes();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const totalNotes = data?.total_notes ?? 0;
  const displayName = user?.name || user?.nickname || 'Mnemonic User';
  const subtitle =
    user?.email || 'Productive note-taker who values clarity and flow.';

  const handleClearNotes = async () => {
    try {
      const result = await deleteAllNotes.mutateAsync();
      setConfirmOpen(false);
      toast.success(`Deleted ${result.deleted_count} notes.`);
    } catch (error) {
      toast.error('Failed to delete notes.');
      console.error('Delete all notes failed:', error);
    }
  };

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
          className='absolute -top-10 right-0 rounded-full bg-white/90 p-2 text-neutral-700 shadow-lg hover:bg-white transition dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800'
          aria-label='Close settings'
        >
          <X size={18} />
        </button>

        <div className='rounded-[32px] bg-linear-to-b from-neutral-50 to-white shadow-[0_30px_80px_rgba(15,23,42,0.15)] p-5 dark:from-neutral-900 dark:to-neutral-950'>
          <div className='rounded-[28px] bg-white border border-neutral-200/60 shadow-[0_10px_30px_rgba(15,23,42,0.08)] overflow-hidden dark:bg-neutral-900 dark:border-neutral-800'>
            <div className='p-5 pb-0'>
              <div className='relative rounded-[24px] bg-neutral-100 border border-neutral-200 shadow-inner overflow-hidden dark:bg-neutral-800 dark:border-neutral-700'>
                {user?.picture ? (
                  <Image
                    src={user.picture}
                    alt={displayName}
                    width={100}
                    height={100}
                    className='h-60 w-full object-cover'
                  />
                ) : (
                  <div className='w-full bg-linear-to-br from-orange-100 via-rose-100 to-amber-100 flex items-center justify-center dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800'>
                    <span className='text-4xl font-semibold text-neutral-700 dark:text-neutral-100'>
                      {getInitials(displayName)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className='px-6 pb-3 p-5 space-y-3'>
              <div className='flex items-center gap-2'>
                <h2 className='text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
                  {displayName}
                </h2>
                <CheckCircle2 size={18} className='text-blue-500' />
              </div>
              <p className='text-sm text-neutral-500 dark:text-neutral-400'>
                {subtitle}
              </p>

              <div className='mt-5 flex items-center justify-between gap-4'>
                <div className='flex items-center gap-5 text-sm text-neutral-600 dark:text-neutral-300'>
                  <div className='flex items-center gap-2'>
                    <FileText size={16} className='text-neutral-400' />
                    <span className='font-semibold text-neutral-800 dark:text-neutral-100'>
                      {isLoading ? '—' : totalNotes}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => setConfirmOpen(true)}
                    className='rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:border-neutral-300 hover:bg-neutral-50 transition disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800'
                    disabled={deleteAllNotes.isPending}
                  >
                    {deleteAllNotes.isPending ? 'Clearing...' : 'Clear notes'}
                  </button>
                  <a
                    href='/auth/logout'
                    className='rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-medium shadow-md hover:bg-neutral-700 transition dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white'
                  >
                    Sign out
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <div className='absolute inset-0 z-10 flex items-center justify-center'>
          <div
            onClick={() => setConfirmOpen(false)}
            className='absolute inset-0 bg-black/20'
          />
          <div className='relative w-full max-w-xs rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_20px_40px_rgba(15,23,42,0.2)] dark:border-neutral-700 dark:bg-neutral-900'>
            <div className='space-y-2'>
              <h3 className='text-base font-semibold text-neutral-900 dark:text-neutral-100'>
                Delete all notes?
              </h3>
              <p className='text-sm text-neutral-500 dark:text-neutral-400'>
                This will permanently remove every note. This action cannot be
                undone.
              </p>
            </div>
            <div className='mt-4 flex items-center justify-end gap-2'>
              <button
                onClick={() => setConfirmOpen(false)}
                className='rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800'
                disabled={deleteAllNotes.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleClearNotes}
                className='rounded-full bg-red-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition disabled:opacity-60 dark:bg-red-700 dark:hover:bg-red-600'
                disabled={deleteAllNotes.isPending}
              >
                {deleteAllNotes.isPending ? 'Deleting...' : 'Delete all'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
