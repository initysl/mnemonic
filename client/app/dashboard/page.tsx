'use client';

import { useState } from 'react';
import NotesTopBar from '@/components/topbar/NotesTopBar';
import NoteList from '@/components/notes/NoteList';
import NoteViewer from '@/components/notes/NoteViewer';
import NoteQuery from '@/components/notes/NoteQuery';
import { Menu, X } from 'lucide-react';

export default function AllNotesPage() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileViewerOpen, setMobileViewerOpen] = useState(false);

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
    setMobileViewerOpen(true);
  };

  return (
    <div className='grid h-screen w-full grid-rows-[auto_1fr] bg-neutral-50 dark:bg-neutral-950'>
      {/* Top Bar */}
      <div className='px-4 md:px-6 pt-4 md:pt-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'>
        <NotesTopBar />
      </div>

      {/* Main Grid - Desktop */}
      <div className='hidden lg:grid grid-cols-[420px_1fr] gap-6 px-6 pb-6 pt-6 overflow-hidden'>
        {/* Notes List */}
        <section className='overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 shadow-sm'>
          <NoteList
            onSelectNote={setSelectedNoteId}
            selectedId={selectedNoteId}
          />
        </section>

        {/* Right Column: Viewer + Query */}
        <section className='grid grid-rows-[1fr_auto] gap-4 overflow-hidden'>
          {/* Viewer */}
          <div className='overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 shadow-sm'>
            <NoteViewer noteId={selectedNoteId} />
          </div>

          {/* Query */}
          <div className='rounded-2xl bg-white dark:bg-neutral-900 shadow-sm'>
            <NoteQuery />
          </div>
        </section>
      </div>

      {/* Mobile Layout */}
      <div className='lg:hidden flex flex-col overflow-hidden'>
        {/* Mobile: Note List or Viewer */}
        {!mobileViewerOpen ? (
          <>
            {/* Note List */}
            <div className='flex-1 overflow-y-auto px-4 py-4'>
              <NoteList
                onSelectNote={handleSelectNote}
                selectedId={selectedNoteId}
              />
            </div>

            {/* Query - Fixed Bottom */}
            <div className='p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'>
              <NoteQuery />
            </div>
          </>
        ) : (
          /* Note Viewer - Full Screen */
          <div className='flex-1 overflow-y-auto bg-white dark:bg-neutral-900'>
            {/* Back Button */}
            <div className='sticky top-0 z-10 flex items-center gap-2 p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'>
              <button
                onClick={() => setMobileViewerOpen(false)}
                className='p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors'
              >
                <X size={20} />
              </button>
              <span className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
                Back to notes
              </span>
            </div>
            <NoteViewer noteId={selectedNoteId} />
          </div>
        )}
      </div>
    </div>
  );
}
