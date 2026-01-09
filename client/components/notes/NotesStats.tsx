import { SlidersHorizontal } from 'lucide-react';

export default function NotesStats() {
  return (
    <div className='flex items-start justify-between'>
      <div>
        <h2 className='text-lg font-semibold text-neutral-900'>All Notes</h2>
        <p className='mt-1 text-sm text-blue-500'>124 Notes</p>
      </div>

      <button
        className='flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
        aria-label='Filter notes'
      >
        <SlidersHorizontal size={16} />
      </button>
    </div>
  );
}
