import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  session: any;
  children: JSX.Element;
}

export default function ProtectedRoute({ session, children }: ProtectedRouteProps) {
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
