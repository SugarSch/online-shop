import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL + '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// แนบ Token ไปทุกครั้งโดยอัตโนมัติ
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // ดึง token จาก storage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;