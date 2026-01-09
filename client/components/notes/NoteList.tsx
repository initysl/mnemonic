'use client';

import { useNotesList } from '@/hooks/useNotes';
import NoteCard from './NoteCard';
import { Loader2, Plus } from 'lucide-react';
import Link from 'next/link';

interface NoteListProps {
  onSelectNote: (id: string) => void;
  selectedId: string | null;
}

export default function NoteList({ onSelectNote, selectedId }: NoteListProps) {
  const { data, isLoading, error } = useNotesList({ page: 1, page_size: 50 });

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='animate-spin text-neutral-400' size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-full p-6 text-center'>
        <div>
          <p className='text-red-500 dark:text-red-400 mb-2'>
            Failed to load notes
          </p>
          <p className='text-sm text-neutral-500 dark:text-neutral-400'>
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  const notes = data?.notes || [];

  if (notes.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-full p-8 text-center'>
        <p className='text-neutral-500 dark:text-neutral-400 mb-4'>
          No notes yet
        </p>
        <Link
          href='/dashboard/notes/new'
          className='inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors'
        >
          <Plus size={18} />
          Create Note
        </Link>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-neutral-200 dark:border-neutral-800'>
        <div className='flex items-center justify-between mb-2'>
          <h2 className='text-xl font-semibold'>All Notes</h2>
          <Link
            href='/dashboard/notes/new'
            className='p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors'
          >
            <Plus size={18} />
          </Link>
        </div>
        <p className='text-sm text-neutral-500 dark:text-neutral-400'>
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </p>
      </div>

      {/* Notes List */}
      <div className='flex-1 overflow-y-auto p-4 space-y-3'>
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isSelected={selectedId === note.id}
            onClick={() => onSelectNote(note.id)}
          />
        ))}
      </div>
    </div>
  );
}
