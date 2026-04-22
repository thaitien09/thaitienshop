import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:1102/api', // Chỉnh lại theo PORT của Backend bạn
  timeout: 10000,
});

// 1. Interceptor cho Request: Tự động đính kèm Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Interceptor cho Response: Xử lý lỗi 401 (Hết hạn Token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        // Gọi API refresh token
        const res = await axios.post('http://localhost:1102/api/auth/refresh', {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
        });
        
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;
        
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);
        
        // Thử lại request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh cũng hỏng thì bắt logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
