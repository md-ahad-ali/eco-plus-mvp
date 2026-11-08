import { Navigate, Outlet } from "react-router";

import { isLoggedIn } from "../lib/auth";

const RequireAuth = () => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default RequireAuth;
