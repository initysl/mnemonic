'use client';

import NoteForm from '@/components/notes/NoteForm';
import { useNote, useUpdateNote } from '@/hooks/useNotes';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EditNotePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: note, isLoading } = useNote(params.id);
  const updateNote = useUpdateNote();

  const handleSubmit = async (data: any) => {
    try {
      await updateNote.mutateAsync({ id: params.id, payload: data });
      toast.success('Note updated successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to update note');
      console.error('Failed to update note:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950'>
        <Loader2 className='animate-spin' size={32} />
      </div>
    );
  }

  if (!note) {
    return (
      <div className='h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950'>
        <div className='text-center'>
          <p className='text-neutral-600 dark:text-neutral-400 mb-4'>
            Note not found
          </p>
          <Link
            href='/dashboard'
            className='text-blue-500 hover:text-blue-600'
          >
            Back to notes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='h-screen overflow-y-auto bg-neutral-50 dark:bg-neutral-950'>
      <div className='max-w-4xl mx-auto p-6 md:p-8'>
        {/* Header */}
        <div className='mb-8'>
          <Link
            href='/dashboard'
            className='inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-4'
          >
            <ArrowLeft size={16} />
            Back to notes
          </Link>
          <h1 className='text-3xl font-semibold text-neutral-900 dark:text-neutral-100'>
            Edit Note
          </h1>
        </div>

        {/* Form */}
        <div className='rounded-2xl bg-white dark:bg-neutral-900 p-6 md:p-8 shadow-sm'>
          <NoteForm
            initialData={{
              title: note.title,
              content: note.content,
              tags: note.tags,
            }}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            submitLabel='Save Changes'
            isLoading={updateNote.isPending}
          />
        </div>
      </div>
    </div>
  );
}
