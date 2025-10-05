import axios from 'axios';

// ✅ Automatically pick correct backend URL for environment
const baseURL = import.meta.env.MODE === 'production'
  ? 'https://coursebackend-3.onrender.com' // Replace with your actual Render backend URL
  : 'https://microcourse.onrender.com';

// ✅ Apply to all Axios requests
axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = true; // allows cookies if needed (optional)

// ✅ Export the configured Axios instance
export default axios;
