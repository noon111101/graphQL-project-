package com.example.graphql.service;

import com.example.graphql.entity.Author;
import com.example.graphql.repository.AuthorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuthorService {

    @Autowired
    private AuthorRepository authorRepository;

    public List<Author> getAllAuthors() {
        return authorRepository.findAll();
    }

    public Optional<Author> getAuthorById(Long id) {
        return authorRepository.findById(id);
    }

    public List<Author> searchAuthorsByName(String name) {
        return authorRepository.findByNameContainingIgnoreCase(name);
    }

    public Author addAuthor(String name, String bio, String country) {
        Author author = new Author();
        author.setName(name);
        author.setBio(bio);
        author.setCountry(country);
        return authorRepository.save(author);
    }

    public Author updateAuthor(Long id, String name, String bio, String country) {
        Optional<Author> optionalAuthor = authorRepository.findById(id);
        if (optionalAuthor.isPresent()) {
            Author author = optionalAuthor.get();
            if (name != null) author.setName(name);
            if (bio != null) author.setBio(bio);
            if (country != null) author.setCountry(country);
            return authorRepository.save(author);
        }
        return null;
    }

    public boolean deleteAuthor(Long id) {
        if (authorRepository.existsById(id)) {
            authorRepository.deleteById(id);
            return true;
        }
        return false;
    }
}

