'use client';

import { Note } from '@/types/note';
import { RetrievedNote } from '@/types/query';
import DateBadge from '@/components/shared/DateBadge';
import { Clock, Calendar, Tag } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface NoteCardProps {
  note: Note | RetrievedNote;
  isSelected?: boolean;
  onClick: () => void;
  index?: number;
  showSimilarity?: boolean;
}

const cardColors = [
  'bg-blue-50 dark:bg-blue-950/20',
  'bg-yellow-50 dark:bg-yellow-950/20',
  'bg-purple-50 dark:bg-purple-950/20',
  'bg-green-50 dark:bg-green-950/20',
  'bg-pink-50 dark:bg-pink-950/20',
];

const iconColors = [
  'bg-blue-100 dark:bg-blue-900/40',
  'bg-yellow-100 dark:bg-yellow-900/40',
  'bg-purple-100 dark:bg-purple-900/40',
  'bg-green-100 dark:bg-green-900/40',
  'bg-pink-100 dark:bg-pink-900/40',
];

export default function NoteCard({
  note,
  isSelected,
  onClick,
  index = 0,
  showSimilarity = false,
}: NoteCardProps) {
  const colorIndex = index % cardColors.length;
  const bgColor = cardColors[colorIndex];
  const iconBg = iconColors[colorIndex];

  // Calculate reading time (rough estimate: 200 words per minute)
  const wordCount = note.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Type guard to check if note is RetrievedNote
  const isRetrievedNote = (
    note: Note | RetrievedNote
  ): note is RetrievedNote => {
    return 'similarity_score' in note;
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'
      } ${bgColor}`}
    >
      <div className='flex gap-3'>
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
        >
          <span className='text-2xl'>📝</span>
        </div>

        {/* Content */}
        <div className='flex-1 min-w-0'>
          <h3 className='font-semibold text-base text-neutral-900 dark:text-neutral-100 line-clamp-1 mb-1'>
            {note.title}
          </h3>
          <p className='text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3'>
            {note.content}
          </p>

          {/* Meta */}
          <div className='flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-500 flex-wrap'>
            <span className='flex items-center gap-1'>
              <Clock size={12} />
              {readingTime} min{readingTime > 1 ? 's' : ''}
            </span>
            <span className='flex items-center gap-1'>
              <Calendar size={12} />
              {format(new Date(note.created_at), 'dd-MM-yyyy')}
            </span>

            {/* Similarity Score for Search Results */}
            {showSimilarity && isRetrievedNote(note) && (
              <span className='flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium'>
                {Math.round(note.similarity_score * 100)}% match
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
