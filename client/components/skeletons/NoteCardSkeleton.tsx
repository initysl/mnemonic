import { Skeleton } from '@/components/ui/skeleton';

export default function NoteCardSkeleton() {
  return (
    <div className='p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 animate-pulse'>
      <div className='flex gap-3'>
        {/* Icon Skeleton */}
        <Skeleton className='w-12 h-12 rounded-xl shrink-0' />

        {/* Content Skeleton */}
        <div className='flex-1 min-w-0 space-y-2'>
          {/* Title */}
          <Skeleton className='h-5 w-3/4' />

          {/* Content lines */}
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-5/6' />

          {/* Meta */}
          <div className='flex gap-3 pt-1'>
            <Skeleton className='h-3 w-16' />
            <Skeleton className='h-3 w-20' />
          </div>
        </div>
      </div>
    </div>
  );
}
