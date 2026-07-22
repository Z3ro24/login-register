import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import NotFound from "../pages/404";

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AuthRoutes;
