'use client';

import { ScrollArea } from '@/components/ui/scroll-area';

export default function NotesPanel() {
  return (
    <section className='w-80 border-r border-neutral-800'>
      <div className='p-4 font-medium'>All Notes</div>

      <ScrollArea className='h-[calc(100vh-64px)]'>
        {/* Map notes here */}
      </ScrollArea>
    </section>
  );
}
