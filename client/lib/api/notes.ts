import { apiClient } from './api';
import {
  Note,
  NoteCreate,
  NoteUpdate,
  NoteListResponse,
  NoteStatsResponse,
  NoteDeleteResponse,
  NoteDeleteAllResponse,
} from '@/types/note';

export const noteAPI = {
  async createNote(payload: NoteCreate): Promise<Note> {
    try {
      const { data } = await apiClient.post<Note>('/notes', payload);
      return data;
    } catch (error) {
      console.error('Failed to create note:', error);
      throw error;
    }
  },

  async getNote(id: string): Promise<Note> {
    try {
      const { data } = await apiClient.get<Note>(`/notes/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to get note with ID ${id}:`, error);
      throw error;
    }
  },

  async listNotes(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    tags?: string[];
    sort_by?: 'created_at' | 'updated_at' | 'title';
    sort_order?: 'asc' | 'desc';
  }): Promise<NoteListResponse> {
    try {
      const { data } = await apiClient.get<NoteListResponse>('/notes', {
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

  async updateNote(id: string, payload: NoteUpdate): Promise<Note> {
    try {
      const { data } = await apiClient.put<Note>(`/notes/${id}`, payload);
      return data;
    } catch (error) {
      console.error(`Failed to update note with ID ${id}:`, error);
      throw error;
    }
  },

  async deleteNote(id: string): Promise<NoteDeleteResponse> {
    try {
      const { data } = await apiClient.delete<NoteDeleteResponse>(
        `/notes/${id}`
      );
      return data;
    } catch (error) {
      console.error(`Failed to delete note with ID ${id}:`, error);
      throw error;
    }
  },

  async deleteAllNotes(): Promise<NoteDeleteAllResponse> {
    try {
      const { data } = await apiClient.delete<NoteDeleteAllResponse>('/notes');
      return data;
    } catch (error) {
      console.error('Failed to delete all notes:', error);
      throw error;
    }
  },

  async getNoteStats(): Promise<NoteStatsResponse> {
    try {
      const { data } = await apiClient.get<NoteStatsResponse>('/notes/stats');
      return data;
    } catch (error) {
      console.error('Failed to get note statistics:', error);
      throw error;
    }
  },
};
