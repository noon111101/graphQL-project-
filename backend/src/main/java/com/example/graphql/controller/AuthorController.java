package com.example.graphql.controller;

import com.example.graphql.entity.Author;
import com.example.graphql.entity.Book;
import com.example.graphql.service.AuthorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class AuthorController {

    @Autowired
    private AuthorService authorService;

    @QueryMapping
    public List<Author> authors() {
        return authorService.getAllAuthors();
    }

    @QueryMapping
    public Author author(@Argument Long id) {
        return authorService.getAuthorById(id).orElse(null);
    }

    @QueryMapping
    public List<Author> searchAuthors(@Argument String name) {
        return authorService.searchAuthorsByName(name);
    }

    @MutationMapping
    public Author addAuthor(@Argument String name,
                           @Argument String bio,
                           @Argument String country) {
        return authorService.addAuthor(name, bio, country);
    }

    @MutationMapping
    public Author updateAuthor(@Argument Long id,
                              @Argument String name,
                              @Argument String bio,
                              @Argument String country) {
        return authorService.updateAuthor(id, name, bio, country);
    }

    @MutationMapping
    public Boolean deleteAuthor(@Argument Long id) {
        return authorService.deleteAuthor(id);
    }

    @SchemaMapping(typeName = "Author", field = "books")
    public List<Book> books(Author author) {
        return author.getBooks();
    }
}
