import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import restApiClient from '../rest-api-client';
import { RestBookDTO } from '../types/rest-types';
import './BookList.css';

const RestBookList: React.FC = () => {
  const [books, setBooks] = useState<RestBookDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTitle, setSearchTitle] = useState('');

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await restApiClient.get<RestBookDTO[]>('/books');
      setBooks(response.data);
    } catch (err) {
      setError('Failed to fetch books from REST API');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchBooks = async () => {
    if (!searchTitle.trim()) {
      fetchBooks();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await restApiClient.get<RestBookDTO[]>(`/books/search`, {
        params: { title: searchTitle }
      });
      setBooks(response.data);
    } catch (err) {
      setError('Failed to search books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }
    try {
      await restApiClient.delete(`/books/${id}`);
      fetchBooks();
    } catch (err) {
      setError('Failed to delete book');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  if (loading) return <div className="loading">Loading books from REST API...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="book-list-container">
      <h1>Books (REST API)</h1>
      
      <div className="actions">
        <Link to="/rest/add-book" className="btn btn-primary">
          Add New Book
        </Link>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchBooks()}
        />
        <button onClick={searchBooks} className="btn btn-secondary">Search</button>
        <button onClick={fetchBooks} className="btn btn-secondary">Clear</button>
      </div>

      <table className="book-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Author</th>
            <th>Pages</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.id}</td>
              <td>{book.title}</td>
              <td>{book.authorName || 'Unknown'}</td>
              <td>{book.pageCount}</td>
              <td className="actions-cell">
                <Link to={`/rest/book/${book.id}`} className="btn btn-info btn-sm">
                  View
                </Link>
                <Link to={`/rest/edit-book/${book.id}`} className="btn btn-warning btn-sm">
                  Edit
                </Link>
                <button 
                  onClick={() => deleteBook(book.id)} 
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {books.length === 0 && (
        <div className="no-data">No books found</div>
      )}
    </div>
  );
};

export default RestBookList;
