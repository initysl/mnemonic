import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { noteAPI } from '@/lib/api/notes';
import { NoteCreate, NoteUpdate } from '@/types/note';

export const useNotesList = (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  tags?: string[];
}) => {
  return useQuery({
    queryKey: ['notes', params],
    queryFn: () => noteAPI.listNotes(params),
  });
};

export const useNote = (id: string) => {
  return useQuery({
    queryKey: ['note', id],
    queryFn: () => noteAPI.getNote(id),
    enabled: !!id,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NoteCreate) => noteAPI.createNote(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
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
    },
  });
};

export const useNoteStats = () => {
  return useQuery({
    queryKey: ['note-stats'],
    queryFn: () => noteAPI.getNoteStats(),
  });
};
