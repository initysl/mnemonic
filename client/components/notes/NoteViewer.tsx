'use client';

import { useNote } from '@/hooks/useNotes';
import {
  Loader2,
  Edit,
  Trash2,
  Calendar,
  Tag,
  Share2,
  Star,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface NoteViewerProps {
  noteId: string | null;
}

export default function NoteViewer({ noteId }: NoteViewerProps) {
  const { data: note, isLoading } = useNote(noteId || '');

  if (!noteId) {
    return (
      <div className='flex items-center justify-center h-full p-8 text-center'>
        <div>
          <p className='text-neutral-500 dark:text-neutral-400 mb-2'>
            Select a note to view
          </p>
          <p className='text-sm text-neutral-500 dark:text-neutral-500'>
            Click on any note from the list
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='animate-spin text-neutral-400' size={32} />
      </div>
    );
  }

  if (!note) {
    return (
      <div className='flex items-center justify-center h-full p-8 text-center'>
        <p className='text-neutral-500 dark:text-neutral-400'>Note not found</p>
      </div>
    );
  }

  return (
    <article className='h-full flex flex-col'>
      {/* Header */}
      <div className='p-6 border-b border-neutral-200 dark:border-neutral-800'>
        <div className='flex items-start justify-between mb-4'>
          <h1 className='text-2xl font-semibold'>{note.title}</h1>
          <div className='flex gap-2'>
            <button className='p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors'>
              <Star size={18} />
            </button>
            <button className='p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors'>
              <Share2 size={18} />
            </button>
            <Link
              href={`/dashboard/notes/${note.id}/edit`}
              className='p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors'
            >
              <Edit size={18} />
            </Link>
            <button className='p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors'>
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className='flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400'>
          <span className='flex items-center gap-1.5'>
            <Calendar size={14} />
            Updated {formatDistanceToNow(new Date(note.updated_at))} ago
          </span>
        </div>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className='flex flex-wrap gap-2 mt-4'>
            {note.tags.map((tag) => (
              <span
                key={tag}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm'
              >
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-6'>
        <div className='prose dark:prose-invert max-w-none'>
          <p className='whitespace-pre-wrap leading-relaxed'>{note.content}</p>
        </div>
      </div>
    </article>
  );
}
