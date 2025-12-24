export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  description?: string;
  authorEntity?: Author;
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
  country?: string;
  books?: Book[];
}
