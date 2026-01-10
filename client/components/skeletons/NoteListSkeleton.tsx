import { FileText, SlidersHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import NoteCardSkeleton from './NoteCardSkeleton';

export default function NoteListSkeleton() {
  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='px-6 py-5 border-b border-neutral-200 dark:border-neutral-800'>
        <div className='flex items-center gap-2 mb-3'>
          <FileText size={20} className='text-neutral-400' />
          <Skeleton className='h-6 w-32' />
        </div>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-4 w-20' />
          <div className='p-1.5 rounded-lg'>
            <SlidersHorizontal size={18} className='text-neutral-400' />
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className='flex-1 overflow-y-auto p-4 space-y-3'>
        {[...Array(6)].map((_, index) => (
          <NoteCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
