// import React, { useEffect, useState, type ReactNode } from "react";
// import axios from "axios";
// import { AuthContext, type AuthContextType } from "./AuthContext.types";

// interface User {
//   id: string;
//   email: string;
// }

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [accessToken, setAccessToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const API_BASE_URL =
//     import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

//   // Check if user is authenticated on app load
//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   const checkAuthStatus = async () => {
//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/enrollment-auth/refresh`,
//         {},
//         {
//           withCredentials: true,
//         }
//       );

//       if (response.data.success) {
//         setAccessToken(response.data.accessToken);
//         // Decode token to get user info or make separate API call
//         const tokenData = JSON.parse(
//           atob(response.data.accessToken.split(".")[1])
//         );
//         setUser({
//           id: tokenData.id,
//           email: tokenData.email,
//         });
//       }
//     } catch (error) {
//       console.error("Auth check failed:", error);
//       setAccessToken(null);
//       setUser(null);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const login = async (email: string, password: string) => {
//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/enrollment-auth/login`,
//         { email, password },
//         {
//           withCredentials: true,
//         }
//       );

//       if (response.data.success) {
//         setAccessToken(response.data.accessToken);
//         setUser(response.data.user);
//       } else {
//         throw new Error(response.data.message || "Login failed");
//       }
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         console.error("Login error:", error);
//         throw new Error(error.response?.data?.message || "Login failed");
//       }
//     }
//   };

//   const logout = async () => {
//     try {
//       await axios.post(
//         `${API_BASE_URL}/enrollment-auth/logout`,
//         {},
//         {
//           withCredentials: true,
//         }
//       );
//     } catch (error) {
//       console.error("Logout error:", error);
//     } finally {
//       setAccessToken(null);
//       setUser(null);
//     }
//   };

//   const value: AuthContextType = {
//     user,
//     accessToken,
//     login,
//     logout,
//     isLoading,
//     isAuthenticated: !!accessToken,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };
