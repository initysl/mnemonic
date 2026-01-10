'use client';

import { useNote, useDeleteNote } from '@/hooks/useNotes';
import NoteViewerSkeleton from '@/components/skeletons/NoteViewerSkeleton';
import {
  Edit,
  Trash2,
  Bold,
  Italic,
  Underline,
  Type,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';

interface NoteViewerProps {
  noteId: string | null;
  onEditClick?: (note: any) => void;
}

export default function NoteViewer({ noteId, onEditClick }: NoteViewerProps) {
  const { data: note, isLoading } = useNote(noteId || '');
  const deleteNote = useDeleteNote();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!noteId) return;

    try {
      await deleteNote.mutateAsync(noteId);
      toast.success('Note deleted successfully');
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error('Failed to delete note');
      console.error('Delete failed:', error);
    }
  };

  if (!noteId) {
    return (
      <div className='flex flex-col items-center justify-center h-full p-8 text-center'>
        <div className='w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4'>
          <Type size={32} className='text-neutral-400' />
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

  if (!note) {
    return (
      <div className='flex items-center justify-center h-full p-8 text-center'>
        <p className='text-neutral-500'>Note not found</p>
      </div>
    );
  }

  return (
    <>
      <article className='h-full flex flex-col'>
        {/* Header */}
        <div className='p-4 md:p-6 border-b border-neutral-200 dark:border-neutral-800'>
          <div className='flex items-start justify-between mb-4'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-3xl'>📝</span>
                <h1 className='text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-100'>
                  {note.title}
                </h1>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <span className='px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'>
                  {formatDistanceToNow(new Date(note.updated_at))} ago
                </span>
              </div>
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => onEditClick?.(note)}
                className='flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium'
              >
                <Edit size={16} />
                <span className='hidden sm:inline'>Edit</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className='p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors'
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

        {/* Text Formatting Toolbar */}
        <div className='p-4 border-t border-neutral-200 dark:border-neutral-800'>
          <div className='flex items-center gap-2'>
            <button className='p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors'>
              <Type size={18} />
            </button>
            <button className='p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors'>
              <Bold size={18} />
            </button>
            <button className='p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors'>
              <Italic size={18} />
            </button>
            <button className='p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors'>
              <Underline size={18} />
            </button>
          </div>
        </div>
      </article>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full shadow-xl'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center'>
                <AlertTriangle
                  size={24}
                  className='text-red-600 dark:text-red-400'
                />
              </div>
              <div>
                <h3 className='font-semibold text-lg text-neutral-900 dark:text-neutral-100'>
                  Delete Note
                </h3>
                <p className='text-sm text-neutral-600 dark:text-neutral-400'>
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className='text-neutral-700 dark:text-neutral-300 mb-6'>
              Are you sure you want to delete "{note.title}"? This will
              permanently remove the note from your collection.
            </p>

            <div className='flex gap-3'>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteNote.isPending}
                className='flex-1 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors'
              >
                Cancel
              </button>
              <button
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
