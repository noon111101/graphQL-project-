package com.example.graphql.config;

import com.example.graphql.entity.Author;
import com.example.graphql.entity.Book;
import com.example.graphql.repository.AuthorRepository;
import com.example.graphql.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private AuthorRepository authorRepository;

    @Override
    public void run(String... args) throws Exception {
        // Create Authors
        Author author1 = new Author(null, "F. Scott Fitzgerald",
                                   "American novelist and short story writer", "USA", null);
        Author author2 = new Author(null, "Harper Lee",
                                   "American novelist known for To Kill a Mockingbird", "USA", null);
        Author author3 = new Author(null, "George Orwell",
                                   "English novelist, essayist, and critic", "United Kingdom", null);

        authorRepository.save(author1);
        authorRepository.save(author2);
        authorRepository.save(author3);

        // Create Books
        Book book1 = new Book(null, "The Great Gatsby", "F. Scott Fitzgerald", 1925,
                             "A classic American novel set in the Jazz Age", author1);
        Book book2 = new Book(null, "To Kill a Mockingbird", "Harper Lee", 1960,
                             "A novel about racial injustice in the American South", author2);
        Book book3 = new Book(null, "1984", "George Orwell", 1949,
                             "A dystopian social science fiction novel", author3);
        Book book4 = new Book(null, "Animal Farm", "George Orwell", 1945,
                             "A satirical allegorical novella", author3);

        bookRepository.save(book1);
        bookRepository.save(book2);
        bookRepository.save(book3);
        bookRepository.save(book4);

        System.out.println("✅ Sample data initialized with Authors and Books!");
    }
}
