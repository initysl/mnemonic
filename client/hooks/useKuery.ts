import { useMutation } from '@tanstack/react-query';
import { queryAPI } from '@/lib/api/query';
import { QueryRequest, QueryResponse } from '@/types/query';

export const useTextQuery = () => {
  return useMutation<QueryResponse, Error, QueryRequest>({
    mutationFn: (payload) => queryAPI.textQuery(payload),
  });
};

export const useVoiceQuery = () => {
  return useMutation<QueryResponse, Error, FormData>({
    mutationFn: (payload) => queryAPI.voiceQuery(payload),
  });
};
