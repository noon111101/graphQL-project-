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
        <h1>📚 Welcome to Book Library</h1>
        <p>Manage your books and authors with GraphQL or REST API</p>
      </div>

      <div className="backend-info">
        <div className="backend-card-info">
          <h3>🔷 GraphQL Backend</h3>
          <p>Port: 8080</p>
          <p>Single endpoint with flexible queries</p>
        </div>
        <div className="backend-card-info">
          <h3>🟦 REST API Backend</h3>
          <p>Port: 8081</p>
          <p>Traditional RESTful endpoints</p>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h2>{booksCount}</h2>
            <p>Books (GraphQL)</p>
          </div>
          <Link to="/books" className="stat-link">View Books →</Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✍️</div>
          <div className="stat-content">
            <h2>{authorsCount}</h2>
            <p>Authors (GraphQL)</p>
          </div>
          <Link to="/authors" className="stat-link">View Authors →</Link>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <h2>REST</h2>
            <p>API Backend</p>
          </div>
          <Link to="/rest/books" className="stat-link">View Books (REST) →</Link>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/add-book" className="action-card">
            <span className="action-icon">➕</span>
            <h3>Add Book (GraphQL)</h3>
            <p>Add a new book via GraphQL</p>
          </Link>

          <Link to="/add-author" className="action-card">
            <span className="action-icon">✨</span>
            <h3>Add Author (GraphQL)</h3>
            <p>Register a new author via GraphQL</p>
          </Link>

          <Link to="/rest/add-book" className="action-card">
            <span className="action-icon">➕</span>
            <h3>Add Book (REST)</h3>
            <p>Add a new book via REST API</p>
          </Link>

          <Link to="/rest/add-author" className="action-card">
            <span className="action-icon">✨</span>
            <h3>Add Author (REST)</h3>
            <p>Register a new author via REST API</p>
          </Link>
        </div>
      </div>

      <div className="features-section">
        <h2>Dual Backend Support</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🔷</div>
            <h3>GraphQL API</h3>
            <p>Flexible queries, single endpoint, efficient data fetching</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🟦</div>
            <h3>REST API</h3>
            <p>Traditional endpoints, standard HTTP methods, easy to understand</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔍</div>
            <h3>Search & Filter</h3>
            <p>Both backends support searching and filtering data</p>
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

