package com.example.restapi.config;

import com.example.restapi.entity.Author;
import com.example.restapi.entity.Book;
import com.example.restapi.repository.AuthorRepository;
import com.example.restapi.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final AuthorRepository authorRepository;
    private final BookRepository bookRepository;
    
    @Override
    public void run(String... args) {
        // Create Authors
        Author author1 = new Author();
        author1.setName("J.K. Rowling");
        author1.setBio("British author, best known for the Harry Potter series");
        authorRepository.save(author1);
        
        Author author2 = new Author();
        author2.setName("George R.R. Martin");
        author2.setBio("American novelist and short story writer");
        authorRepository.save(author2);
        
        Author author3 = new Author();
        author3.setName("J.R.R. Tolkien");
        author3.setBio("English writer and philologist");
        authorRepository.save(author3);
        
        // Create Books
        Book book1 = new Book();
        book1.setTitle("Harry Potter and the Philosopher's Stone");
        book1.setPageCount(223);
        book1.setAuthor(author1);
        bookRepository.save(book1);
        
        Book book2 = new Book();
        book2.setTitle("Harry Potter and the Chamber of Secrets");
        book2.setPageCount(251);
        book2.setAuthor(author1);
        bookRepository.save(book2);
        
        Book book3 = new Book();
        book3.setTitle("A Game of Thrones");
        book3.setPageCount(694);
        book3.setAuthor(author2);
        bookRepository.save(book3);
        
        Book book4 = new Book();
        book4.setTitle("A Clash of Kings");
        book4.setPageCount(768);
        book4.setAuthor(author2);
        bookRepository.save(book4);
        
        Book book5 = new Book();
        book5.setTitle("The Hobbit");
        book5.setPageCount(310);
        book5.setAuthor(author3);
        bookRepository.save(book5);
        
        Book book6 = new Book();
        book6.setTitle("The Lord of the Rings");
        book6.setPageCount(1178);
        book6.setAuthor(author3);
        bookRepository.save(book6);
    }
}
