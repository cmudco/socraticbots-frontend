// src/services/api/instance.ts
import axios from 'axios';
import config from '../../lib/config';

// Create the API instance
export const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});
