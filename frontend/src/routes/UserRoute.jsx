import { Navigate, Outlet } from 'react-router';

const getRolesFromToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map((char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)).join(''),
    );
    return JSON.parse(jsonPayload).roles || [];
  } catch {
    return [];
  }
};

export default function UserRoute() {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/connexion" replace />;
  }

  const roles = getRolesFromToken(token);
  const isPro = roles.some((role) => role.includes('PROFESSIONNEL'));
  const isAdmin = roles.some((role) => role.includes('ADMIN'));

  if (isPro || isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
