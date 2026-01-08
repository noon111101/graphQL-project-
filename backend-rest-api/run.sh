#!/bin/bash

echo "Building REST API Backend..."
mvn clean package -DskipTests

echo "Starting REST API Backend on port 8081..."
java -jar target/rest-api-backend-1.0.0.jar
