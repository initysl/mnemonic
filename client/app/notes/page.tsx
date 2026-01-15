'use client';

import { useEffect, useState, useCallback } from 'react';
import { RetrievedNote } from '@/types/query';
import NotesTopBar from '@/components/topbar/NotesTopBar';
import NoteList from '@/components/notes/NoteList';
import NoteViewer from '@/components/notes/NoteViewer';
import NoteQuery from '@/components/notes/NoteQuery';
import NoteModal from '@/components/notes/NoteModal';
import SettingsModal from '@/components/notes/SettingsModal';
import { ArrowLeft } from 'lucide-react';
import { useCreateNote, useUpdateNote } from '@/hooks/useNotes';
import { toast } from 'sonner';
import { QueryResponse } from '@/types/query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function AllNotesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const noteParam = searchParams.get('note');

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    noteParam
  );
  const [mobileViewerOpen, setMobileViewerOpen] = useState(Boolean(noteParam));
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);

  // Search state
  const [searchResults, setSearchResults] = useState<RetrievedNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<any>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  // Sync URL params to state (only when URL changes externally)
  useEffect(() => {
    if (noteParam !== selectedNoteId) {
      setSelectedNoteId(noteParam);
      setMobileViewerOpen(Boolean(noteParam));
    }
  }, [noteParam]); // Remove selectedNoteId from deps to prevent loop

  // Update URL when selection changes (debounced to prevent loops)
  const updateURL = useCallback(
    (noteId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (noteId) {
        params.set('note', noteId);
      } else {
        params.delete('note');
      }

      const newQuery = params.toString();
      const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname;

      // Only update if URL actually changed
      const currentUrl = window.location.pathname + window.location.search;
      if (currentUrl !== newUrl) {
        router.replace(newUrl, { scroll: false });
      }
    },
    [pathname, router, searchParams]
  );

  // Handle note selection with URL update
  const handleSelectNote = useCallback(
    (id: string) => {
      setSelectedNoteId(id);
      setMobileViewerOpen(true);
      updateURL(id);
    },
    [updateURL]
  );

  // Handle search results
  const handleSearchResults = useCallback(
    (results: RetrievedNote[], query: string) => {
      setSearchResults(results);
      setSearchQuery(query);
      setIsSearchMode(results.length > 0 || query.length > 0);

      // Clear selection when search changes
      if (results.length === 0) {
        setSelectedNoteId(null);
        updateURL(null);
      }
    },
    [updateURL]
  );

  // Handle voice query result
  const handleVoiceResultSelect = useCallback(
    (noteId: string) => {
      setSelectedNoteId(noteId);
      setMobileViewerOpen(true);
      updateURL(noteId);
    },
    [updateURL]
  );

  // Handle answer note click
  const handleAnswerNoteClick = useCallback(
    (noteId: string) => {
      setSelectedNoteId(noteId);
      setMobileViewerOpen(true);
      updateURL(noteId);
    },
    [updateURL]
  );

  // Create Note Handler
  const handleCreateNote = async (data: any) => {
    try {
      await createNote.mutateAsync(data);
      toast.success('Note created successfully!');
      setCreateModalOpen(false);
    } catch (error) {
      toast.error('Failed to create note');
      console.error('Create failed:', error);
    }
  };

  // Edit Note Handler
  const handleEditNote = async (data: any) => {
    if (!noteToEdit?.id) return;

    try {
      await updateNote.mutateAsync({ id: noteToEdit.id, payload: data });
      toast.success('Note updated successfully!');
      setEditModalOpen(false);
      setNoteToEdit(null);
    } catch (error) {
      toast.error('Failed to update note');
      console.error('Update failed:', error);
    }
  };

  // Open Edit Modal
  const openEditModal = useCallback((note: any) => {
    setNoteToEdit(note);
    setEditModalOpen(true);
  }, []);

  // Handle mobile back button
  const handleMobileBack = useCallback(() => {
    setMobileViewerOpen(false);
    setSelectedNoteId(null);
    updateURL(null);
  }, [updateURL]);

  return (
    <div className='grid h-screen w-full grid-rows-[auto_1fr] bg-neutral-50 dark:bg-neutral-950'>
      {/* Top Bar */}
      <div className='p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'>
        <NotesTopBar
          onCreateClick={() => setCreateModalOpen(true)}
          onSettingsClick={() => setSettingsModalOpen(true)}
          isModalOpen={createModalOpen || editModalOpen || settingsModalOpen}
        />
      </div>

      {/* Main Grid - Desktop */}
      <div className='hidden lg:grid grid-cols-[420px_1fr] gap-6 px-6 pb-6 pt-6 overflow-hidden'>
        {/* Notes List */}
        <section className='overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 shadow-sm'>
          <NoteList
            onSelectNote={handleSelectNote}
            selectedId={selectedNoteId}
            searchResults={isSearchMode ? searchResults : undefined}
            searchQuery={searchQuery}
          />
        </section>

        {/* Right Column: Viewer + Query */}
        <section className='grid grid-rows-[1fr_auto] gap-4 overflow-hidden'>
          {/* Viewer */}
          <div className='overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 shadow-sm'>
            <NoteViewer
              noteId={selectedNoteId}
              onEditClick={openEditModal}
              queryResult={queryResult}
              onAnswerNoteClick={handleAnswerNoteClick}
            />
          </div>

          {/* Query */}
          <div className='rounded-2xl bg-white dark:bg-neutral-900 shadow-sm'>
            <NoteQuery
              onSearchResults={handleSearchResults}
              onVoiceResultSelect={handleVoiceResultSelect}
              onQueryResult={setQueryResult}
            />
          </div>
        </section>
      </div>

      {/* Mobile Layout */}
      <div className='lg:hidden flex flex-col overflow-hidden'>
        {!mobileViewerOpen ? (
          <>
            <div className='flex-1 overflow-y-auto py-4'>
              <NoteList
                onSelectNote={handleSelectNote}
                selectedId={selectedNoteId}
                searchResults={isSearchMode ? searchResults : undefined}
                searchQuery={searchQuery}
              />
            </div>
            <div className='border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'>
              <NoteQuery
                onSearchResults={handleSearchResults}
                onVoiceResultSelect={handleVoiceResultSelect}
                onQueryResult={setQueryResult}
              />
            </div>
          </>
        ) : (
          <div className='flex-1 overflow-y-auto bg-white dark:bg-neutral-900'>
            <div className='sticky top-0 z-10 flex items-center gap-2 p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'>
              <button
                onClick={handleMobileBack}
                className='p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors'
              >
                <ArrowLeft size={20} />
              </button>
              <span className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
                Back to notes
              </span>
            </div>
            <NoteViewer
              noteId={selectedNoteId}
              onEditClick={openEditModal}
              queryResult={queryResult}
              onAnswerNoteClick={handleAnswerNoteClick}
            />
          </div>
        )}
      </div>

      {/* Create Modal */}
      <NoteModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateNote}
        title='Create New Note'
        submitLabel='Create'
        isLoading={createNote.isPending}
      />

      {/* Edit Modal */}
      <NoteModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setNoteToEdit(null);
        }}
        onSubmit={handleEditNote}
        initialData={
          noteToEdit
            ? {
                title: noteToEdit.title,
                content: noteToEdit.content,
                tags: noteToEdit.tags,
              }
            : undefined
        }
        title='Edit Note'
        submitLabel='Save'
        isLoading={updateNote.isPending}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </div>
  );
}
