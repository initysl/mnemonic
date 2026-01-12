'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';
import NoteForm from './NoteForm';
import { NoteCreate } from '@/types/note';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NoteCreate) => void;
  initialData?: Partial<NoteCreate>;
  title: string;
  submitLabel: string;
  isLoading?: boolean;
}

export default function NoteModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  submitLabel,
  isLoading = false,
}: NoteModalProps) {
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
      {/* Backdrop */}
      <div
        onClick={onClose}
        className='absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in'
      />

      {/* Modal */}
      <div className='relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-200 flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800'>
          <h2 className='text-2xl font-semibold text-neutral-900 dark:text-neutral-100'>
            {title}
          </h2>
          <button
            onClick={onClose}
            className='p-2 rounded-lg text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className='flex-1 overflow-y-auto p-6'>
          <NoteForm
            initialData={initialData}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitLabel={submitLabel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
