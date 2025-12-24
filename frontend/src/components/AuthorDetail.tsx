import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_AUTHOR, DELETE_AUTHOR, GET_AUTHORS } from '../graphql/queries';
import { Author } from '../types';
import './AuthorDetail.css';

const AuthorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_AUTHOR, {
    variables: { id },
  });

  const [deleteAuthor] = useMutation(DELETE_AUTHOR, {
    refetchQueries: [{ query: GET_AUTHORS }],
    onCompleted: () => {
      alert('Author deleted successfully!');
      navigate('/authors');
    },
    onError: (error) => {
      alert(`Error deleting author: ${error.message}`);
    },
  });

  if (loading) return <div className="loading">Loading author details...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  const author: Author = data?.author;

  if (!author) {
    return <div className="error">Author not found</div>;
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${author.name}"?`)) {
      deleteAuthor({ variables: { id } });
    }
  };

  return (
    <div className="author-detail-container">
      <div className="back-button">
        <Link to="/authors">← Back to Authors</Link>
      </div>

      <div className="author-detail-card">
        <h1>{author.name}</h1>

        {author.country && (
          <div className="detail-section">
            <label>Country:</label>
            <p>🌍 {author.country}</p>
          </div>
        )}

        {author.bio && (
          <div className="detail-section">
            <label>Biography:</label>
            <p>{author.bio}</p>
          </div>
        )}

        {author.books && author.books.length > 0 && (
          <div className="detail-section books-section">
            <label>Books ({author.books.length}):</label>
            <div className="books-grid">
              {author.books.map((book) => (
                <div key={book.id} className="book-item">
                  <h3>{book.title}</h3>
                  <p className="year">📅 {book.year}</p>
                  {book.description && <p className="desc">{book.description}</p>}
                  <Link to={`/book/${book.id}`} className="btn-view-book">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="action-buttons">
          <Link to={`/edit-author/${author.id}`} className="btn-edit">
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

export default AuthorDetail;

