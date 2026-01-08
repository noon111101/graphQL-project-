import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import restApiClient from '../rest-api-client';
import { CreateBookRequest, RestAuthorDTO } from '../types/rest-types';
import './BookForm.css';

const RestAddBook: React.FC = () => {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState<RestAuthorDTO[]>([]);
  const [formData, setFormData] = useState<CreateBookRequest>({
    title: '',
    pageCount: 0,
    authorId: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await restApiClient.get<RestAuthorDTO[]>('/authors');
        setAuthors(response.data);
      } catch (err) {
        console.error('Failed to fetch authors', err);
      }
    };
    fetchAuthors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (formData.pageCount < 1) {
      setError('Page count must be at least 1');
      return;
    }
    if (!formData.authorId) {
      setError('Please select an author');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await restApiClient.post('/books', formData);
      navigate('/rest/books');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create book');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Add New Book (REST API)</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter book title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="pageCount">Page Count *</label>
          <input
            type="number"
            id="pageCount"
            value={formData.pageCount}
            onChange={(e) => setFormData({ ...formData, pageCount: parseInt(e.target.value) })}
            placeholder="Enter page count"
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="authorId">Author *</label>
          <select
            id="authorId"
            value={formData.authorId}
            onChange={(e) => setFormData({ ...formData, authorId: parseInt(e.target.value) })}
            required
          >
            <option value="">Select an author</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Book'}
          </button>
          <Link to="/rest/books" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RestAddBook;
