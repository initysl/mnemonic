import { apiClient } from './api';
import { QueryRequest, RetrievedNote, QueryResponse } from '@/types/query';

export const queryAPI = {
  textQuery: async (payload: QueryRequest): Promise<QueryResponse> => {
    try {
      const { data } = await apiClient.post<QueryResponse>(
        '/query/text',
        payload
      );
      return data;
    } catch (error) {
      console.error('Failed to execute query:', error);
      throw error;
    }
  },

  voiceQuery: async (payload: FormData): Promise<QueryResponse> => {
    try {
      const { data } = await apiClient.post<QueryResponse>(
        '/query/voice',
        payload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data;
    } catch (error) {
      console.error('Failed to execute voice query:', error);
      throw error;
    }
  },
};
