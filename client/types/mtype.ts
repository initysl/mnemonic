export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
  request_id?: string;
}

export interface ApiErrorResponse {
  detail?: string | Record<string, unknown>;
  message?: string;
  request_id?: string;
}

export type ViewMode = 'grid' | 'list';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface FilterState {
  tags: string[];
  searchQuery: string;
  sortBy: 'created_at' | 'updated_at' | 'title';
  sortOrder: 'asc' | 'desc';
}
