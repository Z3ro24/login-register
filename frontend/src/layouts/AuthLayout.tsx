import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div>
      {/* Abstract Background Decorative Elements */}

      <div>
        {/* Aquí se renderiza el Login o el Register */}
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
