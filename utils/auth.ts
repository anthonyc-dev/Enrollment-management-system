export const isAuthenticated = () => {
  return !!localStorage.getItem("token"); // token stored on login
};
