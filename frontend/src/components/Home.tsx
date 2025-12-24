import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_BOOKS, GET_AUTHORS } from '../graphql/queries';
import './Home.css';

const Home: React.FC = () => {
  const { data: booksData } = useQuery(GET_BOOKS);
  const { data: authorsData } = useQuery(GET_AUTHORS);

  const booksCount = booksData?.books?.length || 0;
  const authorsCount = authorsData?.authors?.length || 0;

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>📚 Welcome to GraphQL Library</h1>
        <p>Manage your books and authors collection with ease</p>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h2>{booksCount}</h2>
            <p>Books in Library</p>
          </div>
          <Link to="/books" className="stat-link">View Books →</Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✍️</div>
          <div className="stat-content">
            <h2>{authorsCount}</h2>
            <p>Authors</p>
          </div>
          <Link to="/authors" className="stat-link">View Authors →</Link>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/add-book" className="action-card">
            <span className="action-icon">➕</span>
            <h3>Add New Book</h3>
            <p>Add a new book to your library</p>
          </Link>

          <Link to="/add-author" className="action-card">
            <span className="action-icon">✨</span>
            <h3>Add New Author</h3>
            <p>Register a new author</p>
          </Link>

          <Link to="/books" className="action-card">
            <span className="action-icon">📖</span>
            <h3>Browse Books</h3>
            <p>Explore your book collection</p>
          </Link>

          <Link to="/authors" className="action-card">
            <span className="action-icon">👥</span>
            <h3>Browse Authors</h3>
            <p>View all authors and their works</p>
          </Link>
        </div>
      </div>

      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🔍</div>
            <h3>Search & Filter</h3>
            <p>Easily find books and authors</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3>Fast & Responsive</h3>
            <p>Built with GraphQL for optimal performance</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎨</div>
            <h3>Modern UI</h3>
            <p>Clean and intuitive interface</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔗</div>
            <h3>Relationships</h3>
            <p>Link books with their authors</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

