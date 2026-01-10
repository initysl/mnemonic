'use client';

import { useNotesList } from '@/hooks/useNotes';
import NoteCard from './NoteCard';
import NoteListSkeleton from '@/components/skeletons/NoteListSkeleton';
import { SlidersHorizontal, FileText } from 'lucide-react';

interface NoteListProps {
  onSelectNote: (id: string) => void;
  selectedId: string | null;
}

export default function NoteList({ onSelectNote, selectedId }: NoteListProps) {
  const { data, isLoading, error } = useNotesList({ page: 1, page_size: 50 });

  if (isLoading) {
    return <NoteListSkeleton />;
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-full p-6 text-center'>
        <div>
          <p className='text-red-500 mb-2'>Failed to load notes</p>
          <p className='text-sm text-neutral-500'>Please try again later</p>
        </div>
      </div>
    );
  }

  const notes = data?.notes || [];

  if (notes.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-full p-8 text-center'>
        <div className='w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4'>
          <FileText size={32} className='text-neutral-400' />
        </div>
        <p className='text-neutral-600 dark:text-neutral-400 mb-2 font-medium'>
          No notes yet
        </p>
        <p className='text-sm text-neutral-500 dark:text-neutral-500'>
          Create your first note to get started
        </p>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='px-6 py-5 border-b border-neutral-200 dark:border-neutral-800'>
        <div className='flex items-center gap-2 mb-3'>
          <FileText
            size={20}
            className='text-neutral-900 dark:text-neutral-100'
          />
          <h2 className='text-xl font-semibold text-neutral-900 dark:text-neutral-100'>
            All Notes
          </h2>
        </div>
        <div className='flex items-center justify-between'>
          <p className='text-sm text-blue-500 font-medium'>
            {notes.length} Notes
          </p>
          <button className='p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors'>
            <SlidersHorizontal
              size={18}
              className='text-neutral-600 dark:text-neutral-400'
            />
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className='flex-1 overflow-y-auto p-4 space-y-3'>
        {notes.map((note, index) => (
          <NoteCard
            key={note.id}
            note={note}
            isSelected={selectedId === note.id}
            onClick={() => onSelectNote(note.id)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
