import { Skeleton } from '@/components/ui/skeleton';
import { Type, Bold, Italic, Underline } from 'lucide-react';

export default function NoteViewerSkeleton() {
  return (
    <article className='h-full flex flex-col'>
      {/* Header */}
      <div className='p-4 md:p-6 border-b border-neutral-200 dark:border-neutral-800'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-3xl'>📝</span>
              <Skeleton className='h-8 w-2/3' />
            </div>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-6 w-24 rounded-full' />
            </div>
          </div>
          <div className='flex gap-2'>
            <Skeleton className='h-10 w-20 rounded-full' />
            <Skeleton className='h-10 w-10 rounded-full' />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-4 md:p-6'>
        <div className='space-y-3'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-5/6' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-4/5' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />
          <div className='pt-4' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-5/6' />
          <Skeleton className='h-4 w-full' />
        </div>
      </div>

      {/* Toolbar */}
      <div className='p-4 border-t border-neutral-200 dark:border-neutral-800'>
        <div className='flex items-center gap-2'>
          <div className='p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800'>
            <Type size={18} className='text-neutral-400' />
          </div>
          <div className='p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800'>
            <Bold size={18} className='text-neutral-400' />
          </div>
          <div className='p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800'>
            <Italic size={18} className='text-neutral-400' />
          </div>
          <div className='p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800'>
            <Underline size={18} className='text-neutral-400' />
          </div>
        </div>
      </div>
    </article>
  );
}
