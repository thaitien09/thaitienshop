import axios from 'axios';

// Cấu hình URL gốc tại đây để dễ dàng thay đổi khi deploy
export const BASE_URL = 'http://localhost:3000';
export const API_URL = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
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

    // Nếu lỗi 401 và không phải trang login/register và chưa thử refresh
    const isAuthPath = originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register');
    
    // Xử lý lỗi 429 (Too Many Requests)
    if (error.response?.status === 429) {
      message.error('Bạn thao tác quá nhanh! Vui lòng đợi một lát.');
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !isAuthPath && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        // Gọi API refresh token
        const res = await axios.post(`${API_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
        });
        
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;
        
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
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
