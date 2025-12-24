import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { client } from './apollo-client';
import Navigation from './components/Navigation';
import Home from './components/Home';
import BookList from './components/BookList';
import BookDetail from './components/BookDetail';
import AddBook from './components/AddBook';
import EditBook from './components/EditBook';
import AuthorList from './components/AuthorList';
import AuthorDetail from './components/AuthorDetail';
import AddAuthor from './components/AddAuthor';
import EditAuthor from './components/EditAuthor';
import './App.css';

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/books" element={<BookList />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/add-book" element={<AddBook />} />
            <Route path="/edit-book/:id" element={<EditBook />} />
            <Route path="/authors" element={<AuthorList />} />
            <Route path="/author/:id" element={<AuthorDetail />} />
            <Route path="/add-author" element={<AddAuthor />} />
            <Route path="/edit-author/:id" element={<EditAuthor />} />
          </Routes>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
