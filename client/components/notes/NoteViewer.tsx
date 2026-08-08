'use client';

import { useNote, useDeleteNote } from '@/hooks/useNotes';
import NoteViewerSkeleton from '@/components/skeletons/NoteViewerSkeleton';
import QueryAnswer from '@/components/query/QueryAnswer';
import {
  Edit,
  Trash2,
  NotebookText,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { QueryResponse } from '@/types/query';
import { Note } from '@/types/note';

interface NoteViewerProps {
  noteId: string | null;
  onEditClick?: (note: Note) => void;
  queryResult?: QueryResponse | null;
  onAnswerNoteClick?: (noteId: string) => void;
  onDeleted?: () => void;
}

export default function NoteViewer({
  noteId,
  onEditClick,
  queryResult,
  onAnswerNoteClick,
  onDeleted,
}: NoteViewerProps) {
  const { data: note, isLoading, error, refetch } = useNote(noteId || '');
  const deleteNote = useDeleteNote();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const hasQueryAnswer = Boolean(queryResult);

  const handleDelete = async () => {
    if (!noteId) return;

    try {
      await deleteNote.mutateAsync(noteId);
      toast.success('Note deleted successfully');
      setShowDeleteConfirm(false);
      onDeleted?.();
    } catch (error) {
      toast.error('Failed to delete note');
      console.error('Delete failed:', error);
    }
  };

  if (!noteId && !hasQueryAnswer) {
    return (
      <div className='flex flex-col items-center justify-center h-full p-8 text-center'>
        <div className='w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4'>
          <NotebookText size={32} className='text-neutral-400' />
        </div>
        <p className='text-neutral-600 dark:text-neutral-400 font-medium mb-2'>
          Select a note to view
        </p>
        <p className='text-sm text-neutral-500'>
          Click on any note from the list
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <NoteViewerSkeleton />;
  }

  if (noteId && error) {
    return (
      <div className='flex h-full flex-col items-center justify-center p-8 text-center'>
        <p className='font-medium text-neutral-700 dark:text-neutral-300'>Couldn’t load this note</p>
        <button
          type='button'
          onClick={() => refetch()}
          className='mt-3 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800'
        >
          Try again
        </button>
      </div>
    );
  }

  if (noteId && !note) return null;

  return (
    <>
      {queryResult && (
        <div className='border-b border-neutral-200 dark:border-neutral-800 p-4 '>
          <QueryAnswer result={queryResult} onNoteClick={onAnswerNoteClick} />
        </div>
      )}
      <article className='h-full flex flex-col'>
        {note ? (
          <>
            {/* Header */}
            <div className='p-4 md:p-6 border-b border-neutral-200 dark:border-neutral-800'>
              <div className='flex items-start justify-between mb-4'>
                <div className='flex-1'>
                  <div className='mb-2'>
                    <h1 className='text-base font-medium text-neutral-900 dark:text-neutral-100'>
                      {note.title}
                    </h1>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    <span className='px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'>
                      {formatDistanceToNow(new Date(note.updated_at))} ago
                    </span>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <button
                    type='button'
                    onClick={() => onEditClick?.(note)}
                    className='flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900'
                  >
                    <Edit size={16} />
                    <span className='hidden sm:inline'>Edit</span>
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowDeleteConfirm(true)}
                    aria-label='Delete note'
                    className='rounded-full bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 dark:focus-visible:ring-offset-neutral-900'
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className='flex-1 overflow-y-auto p-4 md:p-6'>
              <div className='prose dark:prose-invert max-w-none'>
                <p className='whitespace-pre-wrap leading-relaxed text-neutral-700 dark:text-neutral-300'>
                  {note.content}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className='flex flex-col items-center justify-center h-full p-8 text-center'>
            <div className='w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4'>
              <NotebookText size={32} className='text-neutral-400' />
            </div>
            <p className='text-neutral-600 dark:text-neutral-400 font-medium mb-2'>
              {queryResult
                ? 'Click a cited note to view the full details'
                : 'Select a note to view'}
            </p>
            <p className='text-sm text-neutral-500'>
              {queryResult
                ? 'Click a cited note in the AI answer above'
                : 'Click on any note from the list'}
            </p>
          </div>
        )}
      </article>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div role='dialog' aria-modal='true' aria-labelledby='delete-note-title' className='bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full shadow-xl'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center'>
                <AlertTriangle
                  size={24}
                  className='text-red-600 dark:text-red-400'
                />
              </div>
              <div>
                <h3 id='delete-note-title' className='font-semibold text-lg text-neutral-900 dark:text-neutral-100'>
                  Delete Note
                </h3>
                <p className='text-sm text-neutral-600 dark:text-neutral-400'>
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className='text-neutral-700 dark:text-neutral-300 mb-6'>
              Are you sure you want to delete "{note?.title}"? This will
              permanently remove the note from your collection.
            </p>

            <div className='flex gap-3'>
              <button
                type='button'
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteNote.isPending}
                className='flex-1 px-4 py-2 text-red-600 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={handleDelete}
                disabled={deleteNote.isPending}
                className='flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
              >
                {deleteNote.isPending && (
                  <Loader2 className='animate-spin' size={16} />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
