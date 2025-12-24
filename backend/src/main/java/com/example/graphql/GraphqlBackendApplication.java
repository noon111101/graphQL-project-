package com.example.graphql;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GraphqlBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(GraphqlBackendApplication.class, args);
        System.out.println("\n🚀 Server ready at http://localhost:8080/graphiql");
        System.out.println("📊 H2 Console at http://localhost:8080/h2-console\n");
    }
}
