import { gql } from '@apollo/client';

// Book Queries
export const GET_BOOKS = gql`
  query GetBooks {
    books {
      id
      title
      author
      year
      description
      authorEntity {
        id
        name
        country
      }
    }
  }
`;

export const GET_BOOK = gql`
  query GetBook($id: ID!) {
    book(id: $id) {
      id
      title
      author
      year
      description
      authorEntity {
        id
        name
        bio
        country
      }
    }
  }
`;

// Author Queries
export const GET_AUTHORS = gql`
  query GetAuthors {
    authors {
      id
      name
      bio
      country
      books {
        id
        title
        year
      }
    }
  }
`;

export const GET_AUTHOR = gql`
  query GetAuthor($id: ID!) {
    author(id: $id) {
      id
      name
      bio
      country
      books {
        id
        title
        author
        year
        description
      }
    }
  }
`;

export const SEARCH_AUTHORS = gql`
  query SearchAuthors($name: String!) {
    searchAuthors(name: $name) {
      id
      name
      bio
      country
    }
  }
`;

// Book Mutations
export const ADD_BOOK = gql`
  mutation AddBook($title: String!, $author: String!, $year: Int!, $description: String) {
    addBook(title: $title, author: $author, year: $year, description: $description) {
      id
      title
      author
      year
      description
    }
  }
`;

export const UPDATE_BOOK = gql`
  mutation UpdateBook($id: ID!, $title: String, $author: String, $year: Int, $description: String) {
    updateBook(id: $id, title: $title, author: $author, year: $year, description: $description) {
      id
      title
      author
      year
      description
    }
  }
`;

export const DELETE_BOOK = gql`
  mutation DeleteBook($id: ID!) {
    deleteBook(id: $id)
  }
`;

// Author Mutations
export const ADD_AUTHOR = gql`
  mutation AddAuthor($name: String!, $bio: String, $country: String) {
    addAuthor(name: $name, bio: $bio, country: $country) {
      id
      name
      bio
      country
    }
  }
`;

export const UPDATE_AUTHOR = gql`
  mutation UpdateAuthor($id: ID!, $name: String, $bio: String, $country: String) {
    updateAuthor(id: $id, name: $name, bio: $bio, country: $country) {
      id
      name
      bio
      country
    }
  }
`;

export const DELETE_AUTHOR = gql`
  mutation DeleteAuthor($id: ID!) {
    deleteAuthor(id: $id)
  }
`;

