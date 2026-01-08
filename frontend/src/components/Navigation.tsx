import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  const [activeBackend, setActiveBackend] = useState<'graphql' | 'rest'>('graphql');

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/home" className="nav-logo">
          📚 Book Library
        </Link>
        
        <div className="backend-selector">
          <button 
            className={activeBackend === 'graphql' ? 'active' : ''}
            onClick={() => setActiveBackend('graphql')}
          >
            GraphQL
          </button>
          <button 
            className={activeBackend === 'rest' ? 'active' : ''}
            onClick={() => setActiveBackend('rest')}
          >
            REST API
          </button>
        </div>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/home" className="nav-link">
              Home
            </Link>
          </li>
          {activeBackend === 'graphql' ? (
            <>
              <li className="nav-item">
                <Link to="/books" className="nav-link">
                  Books
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/authors" className="nav-link">
                  Authors
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/rest/books" className="nav-link">
                  Books (REST)
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/rest/authors" className="nav-link">
                  Authors (REST)
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
