import { apiClient } from './api';
import { SearchRequest, SearchResponse } from '@/types/search';

export const searchAPI = {
  searchNotes: async (payload: SearchRequest): Promise<SearchResponse> => {
    try {
      const { data } = await apiClient.post<SearchResponse>('/search', payload);
      return data;
    } catch (error) {
      console.error('Failed to execute search:', error);
      throw error;
    }
  },
};
