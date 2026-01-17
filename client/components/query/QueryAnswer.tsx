'use client';

import { QueryResponse } from '@/types/query';
import { Sparkles } from 'lucide-react';
import { TypingText, TypingTextWords } from '../effects/typing';
import { useState } from 'react';

interface QueryAnswerProps {
  result: QueryResponse;
  onNoteClick?: (noteId: string) => void;
}

export default function QueryAnswer({ result, onNoteClick }: QueryAnswerProps) {
  const [typingComplete, setTypingComplete] = useState(false);

  return (
    <div className='space-y-4'>
      {/* AI Answer Card */}
      <div className='rounded-2xl px-2 py-3'>
        {/* Header */}
        <div className='flex items-start gap-3 mb-4'>
          <div className='p-2 rounded-lg bg-white dark:bg-neutral-900 shadow-sm'>
            <Sparkles className='h-5 w-5 text-blue-500' />
          </div>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-1'>
              <TypingTextWords
                text=' AI Reasoning'
                delayPerWord={80}
                className='font-medium text-lg text-neutral-900 dark:text-neutral-100'
              />
            </div>
            <TypingTextWords
              text={`Based on ${result.retrieved_notes.length} relevant ${
                result.retrieved_notes.length === 1 ? 'note' : 'notes'
              }`}
              delayPerWord={80}
              className='text-xs text-neutral-500 dark:text-neutral-400'
            />
          </div>
        </div>

        <div className='overflow-y-auto h-52'>
          {/* Answer Content with Typing */}
          <div className='prose dark:prose-invert prose-sm max-w-none'>
            <TypingText
              text={result.answer}
              speed={20}
              onComplete={() => setTypingComplete(true)}
              className='whitespace-pre-wrap leading-relaxed text-neutral-700 dark:text-neutral-300'
            />
          </div>
        </div>

        {/* Source Notes - Show after typing completes */}
        {typingComplete && result.retrieved_notes.length > 0 && (
          <div className='space-y-2 mt-4'>
            <h4 className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>
              Source Notes ({result.retrieved_notes.length})
            </h4>
            <div className='space-y-2 flex flex-wrap'>
              {result.retrieved_notes.map((note, index) => {
                const isCited = result.cited_notes.includes(note.id);

                return (
                  <div
                    key={note.id}
                    onClick={() => onNoteClick?.(note.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isCited
                        ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <TypingText
                        text={note.title}
                        speed={15}
                        delay={index * 200}
                        className='font-medium text-sm text-neutral-900 dark:text-neutral-100 line-clamp-1'
                      />
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
