import { searchAPI } from '@/lib/api/search';
import { SearchRequest, SearchResponse } from '@/types/search';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useSearch = (payload: SearchRequest) => {
  return useQuery<SearchResponse, Error>({
    queryKey: ['search', payload],
    queryFn: () => searchAPI.searchNotes(payload),
    enabled: !!payload.query,
  });
};

export const useSemanticSearch = () => {
  return useMutation<SearchResponse, Error, SearchRequest>({
    mutationFn: (payload) => searchAPI.searchNotes(payload),
  });
};
