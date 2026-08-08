'use client';

import { useNotesList } from '@/hooks/useNotes';
import { useState } from 'react';
import { Note } from '@/types/note';
import { RetrievedNote } from '@/types/query';
import NoteCard from './NoteCard';
import NoteListSkeleton from '@/components/skeletons/NoteListSkeleton';
import { NotebookText, Plus, Search } from 'lucide-react';

interface NoteListProps {
  onSelectNote: (id: string) => void;
  selectedId: string | null;
  searchResults?: RetrievedNote[];
  searchQuery?: string;
  onClearSearch?: () => void;
  onCreateNote?: () => void;
}

export default function NoteList({
  onSelectNote,
  selectedId,
  searchResults,
  searchQuery,
  onClearSearch,
  onCreateNote,
}: NoteListProps) {
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const { data, isLoading, error, refetch } = useNotesList({
    page,
    page_size: pageSize,
  });

  // Determine which notes to display
  const isSearchMode = searchResults !== undefined;
  const displayNotes: (Note | RetrievedNote)[] = isSearchMode
    ? searchResults
    : data?.notes || [];
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / pageSize));

  if (isLoading && !isSearchMode) {
    return <NoteListSkeleton />;
  }

  if (error && !isSearchMode) {
    return (
      <div className='flex items-center justify-center h-full p-6 text-center'>
        <div>
          <p className='text-red-500 mb-2'>Failed to load notes</p>
          <p className='text-sm text-neutral-500'>Please try again later</p>
          <button
            type='button'
            onClick={() => refetch()}
            className='mt-4 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-white dark:text-neutral-900'
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (displayNotes.length === 0 && !isSearchMode) {
    return (
      <div className='flex flex-col items-center justify-center h-full p-8 text-center'>
        <div className='w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4'>
          <NotebookText size={32} className='text-neutral-400' />
        </div>
        <p className='text-neutral-600 dark:text-neutral-400 mb-2 font-medium'>
          No notes yet
        </p>
        <p className='text-sm text-neutral-500 dark:text-neutral-500 mb-4'>
          Create your first note to get started
        </p>
        <button
          type='button'
          onClick={onCreateNote}
          className='inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600'
        >
          <Plus size={16} /> Create note
        </button>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='px-6 py-5 border-b border-neutral-200 dark:border-neutral-800'>
        <div className='flex items-center gap-2 mb-3'>
          {isSearchMode ? (
            <Search size={20} className='text-blue-500' />
          ) : (
            <NotebookText
              size={20}
              className='text-neutral-900 dark:text-neutral-100'
            />
          )}
          <h2 className='text-base font-medium text-neutral-900 dark:text-neutral-100'>
            {isSearchMode ? 'Search Results' : 'All Notes'}
          </h2>
        </div>
        <div className='flex items-center justify-between'>
          {isSearchMode ? (
            <div className='flex items-center gap-2'>
              <p className='text-sm text-blue-500 font-medium'>
                {displayNotes.length} results
              </p>
              {searchQuery && (
                <span className='max-w-40 truncate text-xs text-neutral-500 dark:text-neutral-400'>
                  for “{searchQuery}”
                </span>
              )}
            </div>
          ) : (
            <p className='text-sm text-blue-500 font-medium'>
              {data?.total || 0} {data?.total === 1 ? 'Note' : 'Notes'}
            </p>
          )}
          <div className='flex items-center gap-2'>
            {isSearchMode && (
              <button
                onClick={onClearSearch}
                className='text-xs font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-full px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition'
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className='flex-1 overflow-y-auto p-4 space-y-3'>
        {displayNotes.length === 0 && isSearchMode ? (
          <div className='flex flex-col items-center justify-center h-full p-8 text-center'>
            <div className='w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4'>
              <Search size={32} className='text-neutral-400' />
            </div>
            <p className='text-neutral-600 dark:text-neutral-400 mb-2 font-medium'>
              No results found
            </p>
            <p className='text-sm text-neutral-500'>
              Try different keywords or check your spelling
            </p>
          </div>
        ) : (
          displayNotes.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              isSelected={selectedId === note.id}
              onClick={() => onSelectNote(note.id)}
              index={index}
              showSimilarity={isSearchMode}
            />
          ))
        )}
      </div>
      {!isSearchMode && totalPages > 1 && (
        <div className='flex items-center justify-between border-t border-neutral-200 px-4 py-3 text-sm dark:border-neutral-800'>
          <span className='text-neutral-500 dark:text-neutral-400'>
            Page {page} of {totalPages}
          </span>
          <div className='flex gap-2'>
            <button
              type='button'
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
              className='rounded-lg border border-neutral-200 px-3 py-1.5 text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800'
            >
              Previous
            </button>
            <button
              type='button'
              disabled={page === totalPages}
              onClick={() => setPage((current) => current + 1)}
              className='rounded-lg border border-neutral-200 px-3 py-1.5 text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800'
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
