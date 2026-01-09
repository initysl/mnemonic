'use client';

import { useState } from 'react';
import NotesTopBar from '@/components/topbar/NotesTopBar';
import NoteList from '@/components/notes/NoteList';
import NoteViewer from '@/components/notes/NoteViewer';
import NoteQuery from '@/components/notes/NoteQuery';

export default function AllNotesPage() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  return (
    <div className='grid h-full w-full grid-rows-[auto_1fr] bg-neutral-100'>
      {/* Top Bar */}
      <div className='px-6 pt-6'>
        <NotesTopBar />
      </div>

      {/* Main Grid */}
      <div className='grid grid-cols-[380px_1fr] gap-6 px-6 pb-6 pt-6 overflow-hidden'>
        {/* Notes List */}
        <section className='overflow-y-auto rounded-2xl bg-white shadow-sm'>
          <NoteList
            onSelectNote={setSelectedNoteId}
            selectedId={selectedNoteId}
          />
        </section>

        {/* Right Column: Viewer + Query */}
        <section className='grid grid-rows-[1fr_auto] gap-4 overflow-hidden'>
          {/* Viewer */}
          <div className='overflow-y-auto rounded-2xl bg-white p-6 shadow-sm'>
            <NoteViewer noteId={selectedNoteId} />
          </div>

          {/* Query */}
          <div className='rounded-2xl bg-white p-4 shadow-sm'>
            <NoteQuery />
          </div>
        </section>
      </div>
    </div>
  );
}
