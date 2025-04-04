// src/services/api/instance.ts
import axios from 'axios';

// Create the API instance
export const api = axios.create({
  baseURL: 'https://api.socraticbooks.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
