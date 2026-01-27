import axios from 'axios';

// Keep '/api' so it uses the Next.js rewrite/proxy we set up
const api = axios.create({
    baseURL: '/api',
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    // Clean the token to remove extra quotes
    const token = typeof window !== 'undefined' ? localStorage.getItem('token')?.replace(/"/g, "") : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// api.interceptors.request.use((config) => {
//     const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });

export default api;