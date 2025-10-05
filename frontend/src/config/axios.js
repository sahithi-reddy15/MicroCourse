import axios from 'axios';

// ✅ Automatically pick correct backend URL for environment
const baseURL = import.meta.env.MODE === 'production'
  ? 'https://coursebackend-3.onrender.com/' // Replace with your actual Render backend URL
  : 'http://localhost:5000';

// ✅ Apply to all Axios requests
axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = true; // allows cookies if needed (optional)

export default axios;
