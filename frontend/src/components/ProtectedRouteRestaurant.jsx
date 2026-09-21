import Cookies from "js-cookie";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRouteCustomer = () => {
  const token = Cookies.get("token");
  const role = Cookies.get("role");
  if (token) {
    if (role === "RESTAURANT") {
      return <Outlet />;
    }
  }
  return <Navigate to="/login" replace />;
};

export default ProtectedRouteCustomer;
