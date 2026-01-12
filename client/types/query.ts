export interface QueryRequest {
  query: string;
  top_k?: number;
  min_similarity?: number;
  //   include_follow_ups?: boolean;
}

export interface RetrievedNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  similarity_score: number;
  created_at: string;
}

export interface QueryResponse {
  query: string;
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  retrieved_notes: RetrievedNote[];
  cited_notes: string[];
  //   follow_up_questions?: string[];
  execution_time_ms: number;
}
