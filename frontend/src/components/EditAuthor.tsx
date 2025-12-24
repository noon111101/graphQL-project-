import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_AUTHOR, UPDATE_AUTHOR, GET_AUTHORS } from '../graphql/queries';
import './AuthorForm.css';

const EditAuthor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    country: '',
  });

  const { loading: loadingAuthor } = useQuery(GET_AUTHOR, {
    variables: { id },
    onCompleted: (data) => {
      if (data.author) {
        setFormData({
          name: data.author.name,
          bio: data.author.bio || '',
          country: data.author.country || '',
        });
      }
    },
  });

  const [updateAuthor, { loading }] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: GET_AUTHORS }],
    onCompleted: () => {
      alert('Author updated successfully!');
      navigate(`/author/${id}`);
    },
    onError: (error) => {
      alert(`Error updating author: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAuthor({
      variables: {
        id,
        name: formData.name,
        bio: formData.bio || null,
        country: formData.country || null,
      },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loadingAuthor) return <div className="loading">Loading author...</div>;

  return (
    <div className="form-container">
      <h1>✏️ Edit Author</h1>
      <form onSubmit={handleSubmit} className="author-form">
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter author name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="country">Country</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Enter country (optional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Biography</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Enter author biography (optional)"
            rows={6}
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Updating...' : 'Update Author'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/author/${id}`)}
            className="btn-cancel"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAuthor;
