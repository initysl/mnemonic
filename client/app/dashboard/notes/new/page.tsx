'use client';

import NoteForm from '@/components/notes/NoteForm';
import { useCreateNote } from '@/hooks/useNotes';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewNotePage() {
  const router = useRouter();
  const createNote = useCreateNote();

  const handleSubmit = async (data: any) => {
    try {
      await createNote.mutateAsync(data);
      toast.success('Note created successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to create note');
      console.error('Failed to create note:', error);
    }
  };

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
            Create New Note
          </h1>
        </div>

        {/* Form */}
        <div className='rounded-2xl bg-white dark:bg-neutral-900 p-6 md:p-8 shadow-sm'>
          <NoteForm
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            submitLabel='Create Note'
            isLoading={createNote.isPending}
          />
        </div>
      </div>
    </div>
  );
}
