'use client';

import { Note } from '@/types/note';
import DateBadge from '@/components/shared/DateBadge';
import { MoreVertical, Tag } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  isSelected?: boolean;
  onClick: () => void;
}

export default function NoteCard({ note, isSelected, onClick }: NoteCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700'
          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
    >
      <div className='flex gap-3'>
        <DateBadge date={note.created_at} />

        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2 mb-2'>
            <h3 className='font-semibold text-base line-clamp-1'>
              {note.title}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className='p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors'
            >
              <MoreVertical
                size={16}
                className='text-neutral-500 dark:text-neutral-400'
              />
            </button>
          </div>

          <p className='text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3'>
            {note.content}
          </p>

          {note.tags.length > 0 && (
            <div className='flex flex-wrap gap-1.5'>
              {note.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400'
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span className='px-2 py-0.5 text-xs text-neutral-500'>
                  +{note.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
