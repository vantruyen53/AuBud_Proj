import { useAuth } from "../hooks/useContext";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectRoutes({ redirectTo = "/auth/login" }: { redirectTo?: string }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  return <Outlet />;
}
