import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "../auth";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const token = getToken();

  // ✅ Solo redirige si NO estás en /login y NO tienes token
  if (!token) {
    if (location.pathname !== "/") {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  }

  // ✅ Si tienes token y estás en /, redirige al dashboard
  if (token && location.pathname === "/") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
