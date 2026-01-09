import { Button } from '@/components/ui/button';

export default function NoteViewer() {
  return (
    <div className='h-full rounded-2xl bg-white p-6 flex flex-col'>
      <header className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Salsile Project Brief</h2>
        <Button size='sm'>Edit</Button>
      </header>

      <div className='mt-4 text-sm text-neutral-600 flex-1 overflow-y-auto'>
        {/* Note content */}
        <p>
          Salsile Inc. is a well-established fashion retailer specializing in
          high-quality clothing and accessories...
        </p>
      </div>

      <footer className='mt-4 flex justify-end'>
        <Button>Save</Button>
      </footer>
    </div>
  );
}
