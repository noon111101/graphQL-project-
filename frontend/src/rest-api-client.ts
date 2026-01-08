import axios from 'axios';

// REST API Client cho backend-rest-api (port 8081)
const restApiClient = axios.create({
  baseURL: process.env.REACT_APP_REST_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default restApiClient;
