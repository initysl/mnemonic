'use client';

import { useState } from 'react';
import NotesSidebar from '@/components/notes/NotesSidebar';
import NoteList from '@/components/notes/NoteList';
import NoteViewer from '@/components/notes/NoteViewer';

export default function AllNotesPage() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  return (
    <div className='flex h-full w-full overflow-hidden shadow-2xl'>
      {/* <aside className='hidden lg:block w-64 shrink-0 border-r bg-zinc-100 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-800 overflow-y-auto'>
        <NotesSidebar />
      </aside> */}

      <section className='flex-1 lg:max-w-md xl:max-w-lg mx-2 border-r bg-neutral-50 dark:bg-neutral-900/30 border-neutral-200 dark:border-neutral-800 overflow-y-auto shadow-sm'>
        <NoteList
          onSelectNote={setSelectedNoteId}
          selectedId={selectedNoteId}
        />
      </section>

      <section className='hidden xl:block flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-900/30'>
        <NoteViewer noteId={selectedNoteId} />
      </section>
    </div>
  );
}
