import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import restApiClient from '../rest-api-client';
import { RestAuthorDTO } from '../types/rest-types';
import './AuthorList.css';

const RestAuthorList: React.FC = () => {
  const [authors, setAuthors] = useState<RestAuthorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchName, setSearchName] = useState('');

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await restApiClient.get<RestAuthorDTO[]>('/authors');
      setAuthors(response.data);
    } catch (err) {
      setError('Failed to fetch authors from REST API');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchAuthors = async () => {
    if (!searchName.trim()) {
      fetchAuthors();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await restApiClient.get<RestAuthorDTO[]>(`/authors/search`, {
        params: { name: searchName }
      });
      setAuthors(response.data);
    } catch (err) {
      setError('Failed to search authors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAuthor = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this author?')) {
      return;
    }
    try {
      await restApiClient.delete(`/authors/${id}`);
      fetchAuthors();
    } catch (err) {
      setError('Failed to delete author');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  if (loading) return <div className="loading">Loading authors from REST API...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="author-list-container">
      <h1>Authors (REST API)</h1>
      
      <div className="actions">
        <Link to="/rest/add-author" className="btn btn-primary">
          Add New Author
        </Link>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchAuthors()}
        />
        <button onClick={searchAuthors} className="btn btn-secondary">Search</button>
        <button onClick={fetchAuthors} className="btn btn-secondary">Clear</button>
      </div>

      <div className="author-grid">
        {authors.map((author) => (
          <div key={author.id} className="author-card">
            <h3>{author.name}</h3>
            {author.bio && <p className="bio">{author.bio}</p>}
            <p className="book-count">Books: {author.books?.length || 0}</p>
            <div className="card-actions">
              <Link to={`/rest/author/${author.id}`} className="btn btn-info">
                View Details
              </Link>
              <Link to={`/rest/edit-author/${author.id}`} className="btn btn-warning">
                Edit
              </Link>
              <button 
                onClick={() => deleteAuthor(author.id)} 
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {authors.length === 0 && (
        <div className="no-data">No authors found</div>
      )}
    </div>
  );
};

export default RestAuthorList;
