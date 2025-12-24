import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BOOK, UPDATE_BOOK, GET_BOOKS } from '../graphql/queries';
import './BookForm.css';

const EditBook: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: new Date().getFullYear(),
    description: '',
  });

  const { loading: loadingBook, data } = useQuery(GET_BOOK, {
    variables: { id },
    onCompleted: (data) => {
      if (data.book) {
        setFormData({
          title: data.book.title,
          author: data.book.author,
          year: data.book.year,
          description: data.book.description || '',
        });
      }
    },
  });

  const [updateBook, { loading }] = useMutation(UPDATE_BOOK, {
    refetchQueries: [{ query: GET_BOOKS }],
    onCompleted: () => {
      alert('Book updated successfully!');
      navigate(`/book/${id}`);
    },
    onError: (error) => {
      alert(`Error updating book: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBook({
      variables: {
        id,
        title: formData.title,
        author: formData.author,
        year: parseInt(formData.year.toString()),
        description: formData.description || null,
      },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loadingBook) return <div className="loading">Loading book...</div>;

  return (
    <div className="form-container">
      <h1>✏️ Edit Book</h1>
      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter book title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">Author *</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            placeholder="Enter author name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="year">Year *</label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            min="1000"
            max={new Date().getFullYear() + 10}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter book description (optional)"
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Updating...' : 'Update Book'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/book/${id}`)}
            className="btn-cancel"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBook;

