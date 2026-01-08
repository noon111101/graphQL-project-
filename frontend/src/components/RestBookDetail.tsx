import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import restApiClient from '../rest-api-client';
import { RestBookDTO } from '../types/rest-types';
import './BookDetail.css';

const RestBookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<RestBookDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await restApiClient.get<RestBookDTO>(`/books/${id}`);
        setBook(response.data);
      } catch (err) {
        setError('Failed to fetch book details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBook();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }
    try {
      await restApiClient.delete(`/books/${id}`);
      navigate('/rest/books');
    } catch (err) {
      setError('Failed to delete book');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading book details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!book) return <div className="error">Book not found</div>;

  return (
    <div className="book-detail-container">
      <div className="detail-header">
        <h1>{book.title}</h1>
        <div className="actions">
          <Link to={`/rest/edit-book/${book.id}`} className="btn btn-warning">
            Edit Book
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            Delete Book
          </button>
          <Link to="/rest/books" className="btn btn-secondary">
            Back to List
          </Link>
        </div>
      </div>

      <div className="detail-content">
        <div className="info-section">
          <h2>Book Information</h2>
          <p><strong>ID:</strong> {book.id}</p>
          <p><strong>Title:</strong> {book.title}</p>
          <p><strong>Page Count:</strong> {book.pageCount}</p>
          <p><strong>Author:</strong> {book.authorName || 'Unknown'}</p>
        </div>

        {book.authorId && (
          <div className="author-section">
            <h2>Author Details</h2>
            <Link to={`/rest/author/${book.authorId}`} className="btn btn-info">
              View Author Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestBookDetail;
