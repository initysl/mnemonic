import { format } from 'date-fns';

interface DateBadgeProps {
  date: string;
}

export default function DateBadge({ date }: DateBadgeProps) {
  const dateObj = new Date(date);
  const day = format(dateObj, 'd');
  const month = format(dateObj, 'MMM').slice(0, 3).toUpperCase();

  return (
    <div className='flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0'>
      <span className='text-lg font-semibold leading-none'>{day}</span>
      <span className='text-[10px] text-neutral-500 dark:text-neutral-400 uppercase mt-0.5'>
        {month}
      </span>
    </div>
  );
}
