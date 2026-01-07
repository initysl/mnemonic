export interface SearchRequest {
  query: string;
  top_k?: number;
  min_similarity?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  tags: string[];
  similarity_score: number;
  created_at: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total_results: number;
}
