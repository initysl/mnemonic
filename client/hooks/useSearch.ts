import { searchAPI } from '@/lib/api/search';
import { SearchRequest, SearchResponse } from '@/types/search';
import { useQuery } from '@tanstack/react-query';

export const useSearch = (payload: SearchRequest) => {
  return useQuery<SearchResponse, Error>({
    queryKey: ['search', payload],
    queryFn: () => searchAPI.searchNotes(payload),
    enabled: !!payload.query,
  });
};
