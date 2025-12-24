package com.example.graphql.service;

import com.example.graphql.entity.Book;
import com.example.graphql.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookService {
    
    @Autowired
    private BookRepository bookRepository;
    
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }
    
    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }
    
    public Book addBook(String title, String author, Integer year, String description) {
        Book book = new Book();
        book.setTitle(title);
        book.setAuthor(author);
        book.setYear(year);
        book.setDescription(description);
        return bookRepository.save(book);
    }
    
    public Book updateBook(Long id, String title, String author, Integer year, String description) {
        Optional<Book> optionalBook = bookRepository.findById(id);
        if (optionalBook.isPresent()) {
            Book book = optionalBook.get();
            if (title != null) book.setTitle(title);
            if (author != null) book.setAuthor(author);
            if (year != null) book.setYear(year);
            if (description != null) book.setDescription(description);
            return bookRepository.save(book);
        }
        return null;
    }
    
    public boolean deleteBook(Long id) {
        if (bookRepository.existsById(id)) {
            bookRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
