import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_BOOKS } from '../graphql/queries';
import { Book } from '../types';
import { Link } from 'react-router-dom';
import './BookList.css';

const BookList: React.FC = () => {
  const { loading, error, data, refetch } = useQuery(GET_BOOKS);

  if (loading) return <div className="loading">Loading books...</div>;
  if (error) return <div className="error">Error loading books: {error.message}</div>;

  const books: Book[] = data?.books || [];

  return (
    <div className="book-list-container">
      <div className="header">
        <h1>📚 Book Library</h1>
        <div className="header-actions">
          <button onClick={() => refetch()} className="btn-refresh">
            🔄 Refresh
          </button>
          <Link to="/add-book" className="btn-add">
            ➕ Add New Book
          </Link>
        </div>
      </div>

      <div className="book-grid">
        {books.map((book) => (
          <div key={book.id} className="book-card">
            <h3>{book.title}</h3>
            <p className="author">✍️ {book.author}</p>
            <p className="year">📅 {book.year}</p>
            {book.description && (
              <p className="description">{book.description}</p>
            )}
            {book.authorEntity && (
              <p className="author-entity">
                🌍 {book.authorEntity.name} ({book.authorEntity.country})
              </p>
            )}
            <div className="card-actions">
              <Link to={`/book/${book.id}`} className="btn-view">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && (
        <div className="empty-state">
          <p>No books found. Add your first book!</p>
        </div>
      )}
    </div>
  );
};

export default BookList;

