import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { noteAPI } from '@/lib/api/notes';
import { NoteCreate, NoteUpdate } from '@/types/note';

// Notes only change through this app's own mutations, which invalidate the
// relevant keys. Without a staleTime every query is stale on arrival, so each
// window focus and remount refetches the whole list.
const NOTES_STALE_TIME = 60_000;

export const useNotesList = (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  tags?: string[];
}) => {
  return useQuery({
    queryKey: ['notes', params],
    queryFn: () => noteAPI.listNotes(params),
    staleTime: NOTES_STALE_TIME,
    // Keep the previous page on screen while the next one loads instead of
    // dropping back to the skeleton.
    placeholderData: (previous) => previous,
  });
};

export const useNote = (id: string) => {
  return useQuery({
    queryKey: ['note', id],
    queryFn: () => noteAPI.getNote(id),
    enabled: !!id,
    staleTime: NOTES_STALE_TIME,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NoteCreate) => noteAPI.createNote(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      // The note count and tag set shown in Settings both change.
      queryClient.invalidateQueries({ queryKey: ['note-stats'] });
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: NoteUpdate }) =>
      noteAPI.updateNote(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', variables.id] });
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteAPI.deleteNote(id),
    onSuccess: (_, noteId) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note-stats'] });
      queryClient.removeQueries({ queryKey: ['note', noteId] });
    },
  });
};

export const useDeleteAllNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => noteAPI.deleteAllNotes(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note-stats'] });
      queryClient.removeQueries({ queryKey: ['note'] });
    },
  });
};

export const useNoteStats = () => {
  return useQuery({
    queryKey: ['note-stats'],
    queryFn: () => noteAPI.getNoteStats(),
    staleTime: NOTES_STALE_TIME,
  });
};
