// frontend/config.js
export const API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://microcourse.onrender.com' // Render backend
    : 'http://localhost:5000';           // Local backend
