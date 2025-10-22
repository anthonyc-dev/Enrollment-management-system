import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  return token ? <>{children}</> : <Navigate to="/enrollmentLogin" replace />;
};

export default ProtectedRoute;
