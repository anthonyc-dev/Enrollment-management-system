// import axios, {
//   AxiosResponse,
//   AxiosError,
//   InternalAxiosRequestConfig,
// } from "axios";

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// // Create axios instance
// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   withCredentials: true, // Important for cookies
// });

// // Request interceptor to add auth token
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("accessToken");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor to handle token refresh
// apiClient.interceptors.response.use(
//   (response: AxiosResponse) => {
//     return response;
//   },
//   async (error: AxiosError) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const response = await axios.post(
//           `${API_BASE_URL}/enrollment-auth/refresh`,
//           {},
//           { withCredentials: true }
//         );

//         const { accessToken } = response.data;
//         localStorage.setItem("accessToken", accessToken);

//         // Retry the original request with new token
//         originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         // Refresh failed, redirect to login
//         localStorage.removeItem("accessToken");
//         window.location.href = "/login";
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default apiClient;
