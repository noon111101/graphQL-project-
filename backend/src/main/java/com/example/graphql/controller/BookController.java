package com.example.graphql.controller;

import com.example.graphql.entity.Book;
import com.example.graphql.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class BookController {
    
    @Autowired
    private BookService bookService;
    
    @QueryMapping
    public List<Book> books() {
        return bookService.getAllBooks();
    }
    
    @QueryMapping
    public Book book(@Argument Long id) {
        return bookService.getBookById(id).orElse(null);
    }
    
    @MutationMapping
    public Book addBook(@Argument String title, 
                       @Argument String author, 
                       @Argument Integer year,
                       @Argument String description) {
        return bookService.addBook(title, author, year, description);
    }
    
    @MutationMapping
    public Book updateBook(@Argument Long id,
                          @Argument String title,
                          @Argument String author,
                          @Argument Integer year,
                          @Argument String description) {
        return bookService.updateBook(id, title, author, year, description);
    }
    
    @MutationMapping
    public Boolean deleteBook(@Argument Long id) {
        return bookService.deleteBook(id);
    }
}
