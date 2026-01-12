'use client';

import { QueryResponse } from '@/types/query';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';

interface QueryAnswerProps {
  result: QueryResponse;
  onNoteClick?: (noteId: string) => void;
}

export default function QueryAnswer({ result, onNoteClick }: QueryAnswerProps) {
  return (
    <div className='space-y-4'>
      {/* AI Answer Card */}
      <div className={`rounded-2xl px-2 py-3`}>
        {/* Header */}
        <div className='flex items-start gap-3 mb-4'>
          <div className='p-2 rounded-lg bg-white dark:bg-neutral-900 shadow-sm'>
            <Sparkles className='h-5 w-5 text-blue-500' />
          </div>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-1'>
              <h3 className='font-semibold text-lg text-neutral-900 dark:text-neutral-100'>
                AI Reasoning
              </h3>
            </div>
            <p className='text-xs text-neutral-500 dark:text-neutral-400'>
              Based on {result.retrieved_notes.length} relevant notes
            </p>
          </div>
        </div>

        <div className=' overflow-y-auto h-52'>
          {/* Answer Content */}
          <div className='prose dark:prose-invert prose-sm max-w-none'>
            <p className='text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap'>
              {result.answer}
            </p>
          </div>
        </div>

        {/* Source Notes */}
        {result.retrieved_notes.length > 0 && (
          <div className='space-y-2 mt-4 '>
            <h4 className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>
              Source Notes ({result.retrieved_notes.length})
            </h4>
            <div className='space-y-2 flex flex-wrap'>
              {result.retrieved_notes.map((note) => {
                const isCited = result.cited_notes.includes(note.id);

                return (
                  <div
                    key={note.id}
                    onClick={() => onNoteClick?.(note.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all  ${
                      isCited
                        ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className='flex items-start justify-between gap-2 mb-1'>
                      <h5 className='font-medium text-sm text-neutral-900 dark:text-neutral-100 line-clamp-1'>
                        {note.title}
                      </h5>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
