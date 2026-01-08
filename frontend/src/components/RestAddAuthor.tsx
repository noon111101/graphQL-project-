import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import restApiClient from '../rest-api-client';
import { CreateAuthorRequest } from '../types/rest-types';
import './AuthorForm.css';

const RestAddAuthor: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateAuthorRequest>({
    name: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await restApiClient.post('/authors', formData);
      navigate('/rest/authors');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create author');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Add New Author (REST API)</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter author name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Biography</label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Enter author biography"
            rows={5}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Author'}
          </button>
          <Link to="/rest/authors" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RestAddAuthor;
