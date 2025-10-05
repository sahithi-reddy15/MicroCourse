import axios from 'axios';

// Automatically pick correct backend URL for environment
const baseURL = import.meta.env.MODE === 'production'
  ? 'https://microcourse.onrender.com' // Render backend
  : 'http://localhost:5000'; // Local dev backend

// Create a configured Axios instance
const instance = axios.create({
  baseURL,
  withCredentials: true, // needed if your backend uses cookies
});

export default instance;
