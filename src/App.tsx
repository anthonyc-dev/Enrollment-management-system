import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRedirectService } from "./authentication/useRedirectService";
import { AuthProvider } from "./authentication/AuthContext";

// Component to initialize redirect service inside Router context
const AppWithRedirectService: React.FC = () => {
  useRedirectService(); // Initialize redirect service with navigate function

  return (
    <>
      <AppRoutes />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppWithRedirectService />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
