export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface NoteCreate {
  title: string;
  content: string;
  tags: string[];
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface NoteListResponse {
  notes: Note[];
  total: number;
  page: number;
  page_size: number;
}

export interface NoteDeleteResponse {
  message: string;
  deleted_id: string;
}

export interface NoteStatsResponse {
  total_notes: number;
  tags_count: Record<string, number>;
}
