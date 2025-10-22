// PublicRoute.tsx
import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  return token ? <Navigate to="/" replace /> : <>{children}</>;
};

export default PublicRoute;
