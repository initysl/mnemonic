import clsx from 'clsx';

type NoteCardProps = {
  title?: string;
  preview?: string;
  readTime?: string;
  date?: string;
  isActive?: boolean;
  onClick?: () => void;
};

export default function NoteCard({
  title = 'Salsile project brief',
  preview = 'No, going all perfect! Let me show you images of the project.',
  readTime = '4 mins',
  date = '14-08-2023',
  isActive = false,
  onClick,
}: NoteCardProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full rounded-xl p-4 text-left transition border',
        isActive
          ? 'bg-indigo-50 border-indigo-200'
          : 'bg-white border-neutral-200 hover:bg-neutral-50'
      )}
    >
      <div className='flex gap-4'>
        {/* Thumbnail */}
        <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-200 text-indigo-700 font-semibold'>
          📄
        </div>

        {/* Content */}
        <div className='flex-1'>
          <h3 className='text-sm font-semibold text-neutral-900'>{title}</h3>

          <p className='mt-1 line-clamp-2 text-xs text-neutral-600'>
            {preview}
          </p>

          <div className='mt-2 flex items-center gap-3 text-xs text-neutral-400'>
            <span className='rounded-full bg-neutral-100 px-2 py-0.5'>
              {readTime}
            </span>
            <span>{date}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
