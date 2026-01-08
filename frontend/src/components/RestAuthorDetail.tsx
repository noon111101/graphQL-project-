import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import restApiClient from '../rest-api-client';
import { RestAuthorDTO } from '../types/rest-types';
import './AuthorDetail.css';

const RestAuthorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [author, setAuthor] = useState<RestAuthorDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await restApiClient.get<RestAuthorDTO>(`/authors/${id}`);
        setAuthor(response.data);
      } catch (err) {
        setError('Failed to fetch author details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAuthor();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this author?')) {
      return;
    }
    try {
      await restApiClient.delete(`/authors/${id}`);
      navigate('/rest/authors');
    } catch (err) {
      setError('Failed to delete author');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading author details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!author) return <div className="error">Author not found</div>;

  return (
    <div className="author-detail-container">
      <div className="detail-header">
        <h1>{author.name}</h1>
        <div className="actions">
          <Link to={`/rest/edit-author/${author.id}`} className="btn btn-warning">
            Edit Author
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            Delete Author
          </button>
          <Link to="/rest/authors" className="btn btn-secondary">
            Back to List
          </Link>
        </div>
      </div>

      <div className="detail-content">
        <div className="info-section">
          <h2>Author Information</h2>
          <p><strong>ID:</strong> {author.id}</p>
          <p><strong>Name:</strong> {author.name}</p>
          {author.bio && (
            <p><strong>Biography:</strong> {author.bio}</p>
          )}
        </div>

        <div className="books-section">
          <h2>Books by {author.name}</h2>
          {author.books && author.books.length > 0 ? (
            <div className="books-list">
              {author.books.map((book) => (
                <div key={book.id} className="book-item">
                  <h3>{book.title}</h3>
                  <p>Pages: {book.pageCount}</p>
                  <Link to={`/rest/book/${book.id}`} className="btn btn-info btn-sm">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p>No books found for this author</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestAuthorDetail;
