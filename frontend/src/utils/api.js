import axios from 'axios';


const API = axios.create({
    baseURL: 'http://localhost:5001/api',
});

API.interceptors.request.use((config) => {
    
    const profile = localStorage.getItem('findr_user');
    
    if (profile) {
        const { token } = JSON.parse(profile);
        
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;