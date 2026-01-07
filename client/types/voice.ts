import { SearchResult } from './search';

export interface TranscriptionResponse {
  transcribed_text: string;
  language?: string;
  duration_ms?: number;
}

export interface VoiceQueryResponse {
  transcribed_text: string;
  query: string;
  results: SearchResult[];
  total_results: number;
}
