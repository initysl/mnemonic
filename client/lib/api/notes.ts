import { apiClient } from './api';
import { Note, NoteCreate, NoteUpdate, NoteListResponse } from '@/types/note';

export const noteAPI = {
  createNote: async (payload: NoteCreate): Promise<Note> => {
    try {
      const { data } = await apiClient.post<Note>('/notes/', payload);
      return data;
    } catch (error) {
      console.error('Failed to create note:', error);
      throw error;
    }
  },

  getNote: async (id: string): Promise<Note> => {
    try {
      const { data } = await apiClient.get<Note>(`/notes/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to get note with ID ${id}:`, error);
      throw error;
    }
  },

  listNotes: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    tags?: string[];
    sort_by?: 'created_at' | 'updated_at' | 'title';
    sort_order?: 'asc' | 'desc';
  }): Promise<NoteListResponse> => {
    try {
      const { data } = await apiClient.get<NoteListResponse>('/notes/', {
        params: {
          ...params,
          tags: params?.tags?.join(','),
        },
      });
      return data;
    } catch (error) {
      console.error('Failed to list notes:', error);
      throw error;
    }
  },

  updateNote: async (id: string, payload: NoteUpdate): Promise<Note> => {
    try {
      const { data } = await apiClient.put<Note>(`/notes/${id}`, payload);
      return data;
    } catch (error) {
      console.error(`Failed to update note with ID ${id}:`, error);
      throw error;
    }
  },

  deleteNote: async (id: string): Promise<{ message: string }> => {
    try {
      const { data } = await apiClient.delete<{ message: string }>(
        `/notes/${id}`
      );
      return data;
    } catch (error) {
      console.error(`Failed to delete note with ID ${id}:`, error);
      throw error;
    }
  },
};
