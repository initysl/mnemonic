export interface QueryRequest {
  query: string;
  top_k?: number;
  min_similarity?: number;
}

export interface QueryResponse {
  query: string;
  results: Array<{
    id: string;
    title: string;
    content: string;
    tags: string[];
    similarity_score: number;
    created_at: string;
  }>;
  total_results: number;
}
