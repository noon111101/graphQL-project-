package com.example.restapi.service;

import com.example.restapi.dto.AuthorDTO;
import com.example.restapi.dto.BookDTO;
import com.example.restapi.dto.CreateAuthorRequest;
import com.example.restapi.entity.Author;
import com.example.restapi.repository.AuthorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthorService {
    
    private final AuthorRepository authorRepository;
    
    @Transactional(readOnly = true)
    public List<AuthorDTO> getAllAuthors() {
        return authorRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public AuthorDTO getAuthorById(Long id) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Author not found with id: " + id));
        return convertToDTO(author);
    }
    
    @Transactional(readOnly = true)
    public List<AuthorDTO> searchAuthorsByName(String name) {
        return authorRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public AuthorDTO createAuthor(CreateAuthorRequest request) {
        Author author = new Author();
        author.setName(request.getName());
        author.setBio(request.getBio());
        
        Author savedAuthor = authorRepository.save(author);
        return convertToDTO(savedAuthor);
    }
    
    @Transactional
    public AuthorDTO updateAuthor(Long id, CreateAuthorRequest request) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Author not found with id: " + id));
        
        author.setName(request.getName());
        author.setBio(request.getBio());
        
        Author updatedAuthor = authorRepository.save(author);
        return convertToDTO(updatedAuthor);
    }
    
    @Transactional
    public void deleteAuthor(Long id) {
        if (!authorRepository.existsById(id)) {
            throw new RuntimeException("Author not found with id: " + id);
        }
        authorRepository.deleteById(id);
    }
    
    private AuthorDTO convertToDTO(Author author) {
        AuthorDTO dto = new AuthorDTO();
        dto.setId(author.getId());
        dto.setName(author.getName());
        dto.setBio(author.getBio());
        
        if (author.getBooks() != null) {
            List<BookDTO> bookDTOs = author.getBooks().stream()
                    .map(book -> {
                        BookDTO bookDTO = new BookDTO();
                        bookDTO.setId(book.getId());
                        bookDTO.setTitle(book.getTitle());
                        bookDTO.setPageCount(book.getPageCount());
                        bookDTO.setAuthorId(author.getId());
                        bookDTO.setAuthorName(author.getName());
                        return bookDTO;
                    })
                    .collect(Collectors.toList());
            dto.setBooks(bookDTOs);
        }
        
        return dto;
    }
}
