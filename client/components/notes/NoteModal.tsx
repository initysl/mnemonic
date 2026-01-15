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
        className='absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in'
      />

      {/* Modal */}
      <div className='relative w-full max-w-2xl animate-in zoom-in-95 fade-in duration-200'>
        <button
          onClick={onClose}
          className='absolute -top-10 right-0 rounded-full bg-white/90 p-2 text-neutral-700 shadow-lg hover:bg-white transition'
          aria-label='Close note modal'
        >
          <X size={18} />
        </button>

        <div className='rounded-[32px] bg-gradient-to-b from-neutral-50 to-white shadow-[0_30px_80px_rgba(15,23,42,0.15)] p-5'>
          <div className='rounded-[28px] bg-white border border-neutral-200/60 shadow-[0_10px_30px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col max-h-[70vh]'>
            {/* Header */}
            <div className='flex items-center justify-between px-6 py-5 border-b border-neutral-200/70'>
              <h2 className='text-xl font-medium text-neutral-900'>{title}</h2>
            </div>

            {/* Content - Scrollable */}
            <div className='flex-1 overflow-y-auto px-6 py-5'>
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
      </div>
    </div>
  );
}
