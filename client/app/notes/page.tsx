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
import { Note, NoteCreate, NoteUpdate } from '@/types/note';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function AllNotesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const noteParam = searchParams.get('note');

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    noteParam,
  );
  const [mobileViewerOpen, setMobileViewerOpen] = useState(Boolean(noteParam));
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);
  const [answerSelectedNoteId, setAnswerSelectedNoteId] = useState<
    string | null
  >(null);

  const [searchResults, setSearchResults] = useState<RetrievedNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  // Sync URL params to state (only when URL changes externally)
  useEffect(() => {
    if (noteParam !== selectedNoteId) {
      setSelectedNoteId(noteParam);
      setMobileViewerOpen(Boolean(noteParam));
    }
  }, [noteParam]);

  // Update URL when selection changes (debounced to prevent loops)
  const updateURL = useCallback(
    (noteId: string | null) => {
      const params = new URLSearchParams(window.location.search);

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
    [pathname, router],
  );

  // Handle note selection with URL update
  const handleSelectNote = useCallback(
    (id: string) => {
      setSelectedNoteId(id);
      setAnswerSelectedNoteId(id);
      setMobileViewerOpen(true);
      updateURL(id);
    },
    [updateURL],
  );

  // Handle search results
  const handleSearchResults = useCallback(
    (results: RetrievedNote[], query: string) => {
      setSearchResults(results);
      setSearchQuery(query);
      setIsSearchMode(results.length > 0 || query.length > 0);
      setAnswerSelectedNoteId(null);

    },
    [],
  );

  // Handle voice query result
  const handleVoiceResultSelect = useCallback(
    (noteId: string) => {
      setSelectedNoteId(noteId);
      setMobileViewerOpen(true);
      updateURL(noteId);
    },
    [updateURL],
  );

  // Handle answer note click
  const handleAnswerNoteClick = useCallback(
    (noteId: string) => {
      setAnswerSelectedNoteId(noteId);
      setSelectedNoteId(noteId);
      setMobileViewerOpen(true);
      updateURL(noteId);
    },
    [updateURL],
  );

  const handleQueryResult = useCallback((result: QueryResponse | null) => {
    setQueryResult(result);
    setAnswerSelectedNoteId(null);
  }, []);

  const viewerNoteId = answerSelectedNoteId ?? selectedNoteId;

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchQuery('');
    setIsSearchMode(false);
    setQueryResult(null);
    setAnswerSelectedNoteId(null);
  }, []);

  // Create Note Handler
  const handleCreateNote = async (data: NoteCreate) => {
    try {
      await createNote.mutateAsync(data);
      toast.success('Note created successfully!');
      setCreateModalOpen(false);
    } catch (error) {
      toast.error('Failed to create note');
      console.error('Create failed:', error);
      throw error;
    }
  };

  // Edit Note Handler
  const handleEditNote = async (data: NoteUpdate) => {
    if (!noteToEdit?.id) return;

    try {
      await updateNote.mutateAsync({ id: noteToEdit.id, payload: data });
      toast.success('Note updated successfully!');
      setEditModalOpen(false);
      setNoteToEdit(null);
    } catch (error) {
      toast.error('Failed to update note');
      console.error('Update failed:', error);
      throw error;
    }
  };

  // Open Edit Modal
  const openEditModal = useCallback((note: Note) => {
    setNoteToEdit(note);
    setEditModalOpen(true);
  }, []);

  const handleDeleted = useCallback(() => {
    setSelectedNoteId(null);
    setAnswerSelectedNoteId(null);
    setQueryResult(null);
    setMobileViewerOpen(false);
    updateURL(null);
  }, [updateURL]);

  // Handle mobile back button
  const handleMobileBack = useCallback(() => {
    setMobileViewerOpen(false);
    setSelectedNoteId(null);
    setAnswerSelectedNoteId(null);
    updateURL(null);
  }, [updateURL]);

  return (
    <div className='grid h-dvh w-full grid-rows-[auto_1fr] overflow-hidden bg-neutral-50 dark:bg-neutral-950'>
      {/* Top Bar */}
      <div className='p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'>
        <NotesTopBar
          onCreateClick={() => setCreateModalOpen(true)}
          onAllClick={clearSearch}
          onSettingsClick={() => setSettingsModalOpen(true)}
          isModalOpen={createModalOpen || editModalOpen || settingsModalOpen}
        />
      </div>

      {/*
        One tree for both breakpoints. Rendering separate desktop and mobile
        trees meant every note list, viewer and query panel was mounted twice
        and only hidden with CSS, doubling React work and DOM nodes, and giving
        each copy its own pagination state. Placement is done with grid areas
        so the same nodes can sit in a two-column layout on large screens and a
        single column on small ones.
      */}
      <div className='grid min-h-0 grid-cols-1 grid-rows-[1fr_auto] gap-4 overflow-hidden p-4 lg:grid-cols-[420px_1fr] lg:gap-6 lg:p-6'>
        {/* Notes List */}
        <section
          className={`min-h-0 overflow-y-auto rounded-2xl bg-white shadow-sm dark:bg-neutral-900 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:block ${
            mobileViewerOpen ? 'hidden' : 'row-start-1'
          }`}
        >
          <NoteList
            onSelectNote={handleSelectNote}
            selectedId={selectedNoteId}
            searchResults={isSearchMode ? searchResults : undefined}
            searchQuery={searchQuery}
            onClearSearch={clearSearch}
            onCreateNote={() => setCreateModalOpen(true)}
          />
        </section>

        {/* Viewer */}
        <section
          className={`min-h-0 overflow-y-auto rounded-2xl bg-white shadow-sm dark:bg-neutral-900 lg:col-start-2 lg:row-start-1 lg:block ${
            mobileViewerOpen ? 'row-start-1' : 'hidden'
          }`}
        >
          {/* Mobile-only back affordance; on large screens both panes are visible. */}
          <div className='sticky top-0 z-10 flex items-center gap-2 border-b border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 lg:hidden'>
            <button
              type='button'
              onClick={handleMobileBack}
              aria-label='Back to notes'
              className='rounded-lg bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600'
            >
              <ArrowLeft size={20} />
            </button>
            <span className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
              Back to notes
            </span>
          </div>
          <NoteViewer
            noteId={viewerNoteId}
            onEditClick={openEditModal}
            queryResult={queryResult}
            onAnswerNoteClick={handleAnswerNoteClick}
            onDeleted={handleDeleted}
          />
        </section>

        {/* Query */}
        <div
          className={`rounded-2xl bg-white shadow-sm dark:bg-neutral-900 lg:col-start-2 lg:row-start-2 lg:block ${
            mobileViewerOpen ? 'hidden' : 'row-start-2'
          }`}
        >
          <NoteQuery
            onSearchResults={handleSearchResults}
            onVoiceResultSelect={handleVoiceResultSelect}
            onQueryResult={handleQueryResult}
          />
        </div>
      </div>

      {/* Create Modal */}
      <NoteModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateNote}
        title='Create New Note'
        submitLabel='Create'
        isLoading={createNote.isPending}
        draftKey='new-note'
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
        draftKey={noteToEdit ? `edit-note-${noteToEdit.id}` : undefined}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </div>
  );
}
