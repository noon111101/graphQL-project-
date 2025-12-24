import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_AUTHORS } from '../graphql/queries';
import { Author } from '../types';
import { Link } from 'react-router-dom';
import './AuthorList.css';

const AuthorList: React.FC = () => {
  const { loading, error, data, refetch } = useQuery(GET_AUTHORS);

  if (loading) return <div className="loading">Loading authors...</div>;
  if (error) return <div className="error">Error loading authors: {error.message}</div>;

  const authors: Author[] = data?.authors || [];

  return (
    <div className="author-list-container">
      <div className="header">
        <h1>✍️ Authors</h1>
        <div className="header-actions">
          <button onClick={() => refetch()} className="btn-refresh">
            🔄 Refresh
          </button>
          <Link to="/add-author" className="btn-add">
            ➕ Add New Author
          </Link>
        </div>
      </div>

      <div className="author-grid">
        {authors.map((author) => (
          <div key={author.id} className="author-card">
            <h3>{author.name}</h3>
            {author.country && <p className="country">🌍 {author.country}</p>}
            {author.bio && <p className="bio">{author.bio}</p>}
            {author.books && author.books.length > 0 && (
              <div className="books-count">
                📚 {author.books.length} book{author.books.length > 1 ? 's' : ''}
              </div>
            )}
            <div className="card-actions">
              <Link to={`/author/${author.id}`} className="btn-view">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {authors.length === 0 && (
        <div className="empty-state">
          <p>No authors found. Add your first author!</p>
        </div>
      )}
    </div>
  );
};

export default AuthorList;

