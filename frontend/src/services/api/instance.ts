// src/services/api/instance.ts
import axios from 'axios';

// Create the API instance
export const api = axios.create({
  baseURL: 'https://socratic-bots-api.hss.cmu.edu/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
