import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BOOK, DELETE_BOOK, GET_BOOKS } from '../graphql/queries';
import { Book } from '../types';
import './BookDetail.css';

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_BOOK, {
    variables: { id },
  });

  const [deleteBook] = useMutation(DELETE_BOOK, {
    refetchQueries: [{ query: GET_BOOKS }],
    onCompleted: () => {
      alert('Book deleted successfully!');
      navigate('/books');
    },
    onError: (error) => {
      alert(`Error deleting book: ${error.message}`);
    },
  });

  if (loading) return <div className="loading">Loading book details...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  const book: Book = data?.book;

  if (!book) {
    return <div className="error">Book not found</div>;
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      deleteBook({ variables: { id } });
    }
  };

  return (
    <div className="book-detail-container">
      <div className="back-button">
        <Link to="/books">← Back to Books</Link>
      </div>

      <div className="book-detail-card">
        <h1>{book.title}</h1>

        <div className="detail-section">
          <label>Author:</label>
          <p>✍️ {book.author}</p>
        </div>

        <div className="detail-section">
          <label>Year:</label>
          <p>📅 {book.year}</p>
        </div>

        {book.description && (
          <div className="detail-section">
            <label>Description:</label>
            <p>{book.description}</p>
          </div>
        )}

        {book.authorEntity && (
          <div className="detail-section author-info">
            <label>Author Information:</label>
            <div className="author-box">
              <h3>{book.authorEntity.name}</h3>
              {book.authorEntity.country && <p>🌍 {book.authorEntity.country}</p>}
              {book.authorEntity.bio && <p className="bio">{book.authorEntity.bio}</p>}
              <Link to={`/author/${book.authorEntity.id}`} className="btn-view-author">
                View Author Details
              </Link>
            </div>
          </div>
        )}

        <div className="action-buttons">
          <Link to={`/edit-book/${book.id}`} className="btn-edit">
            ✏️ Edit
          </Link>
          <button onClick={handleDelete} className="btn-delete">
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;

