import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach access token automatically | All requests automatically include the token:
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling expired access tokens
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshRes = await axios.post<{ accessToken: string }>(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
          }/enrollment-auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshRes.data.accessToken;

        localStorage.setItem("accessToken", newToken);
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newToken}`;

        return axiosInstance(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        window.location.href = "/enrollmentLogin";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
