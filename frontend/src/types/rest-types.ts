// Types cho REST API
export interface RestAuthorDTO {
  id: number;
  name: string;
  bio?: string;
  books?: RestBookDTO[];
}

export interface RestBookDTO {
  id: number;
  title: string;
  pageCount: number;
  authorId: number;
  authorName?: string;
}

export interface CreateAuthorRequest {
  name: string;
  bio?: string;
}

export interface CreateBookRequest {
  title: string;
  pageCount: number;
  authorId: number;
}
