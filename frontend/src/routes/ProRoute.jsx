import React from 'react';
import { Navigate } from 'react-router';
import Header from '../components/Header';

export default function ProRoute() {
  const token = localStorage.getItem('token');

  // Fonction pour décoder le token JWT et récupérer les rôles
  const getRolesFromToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(jsonPayload).roles || [];
    } catch (e) {
      return [];
    }
  };

  // Vérifier que l'utilisateur est authentifié
  if (!token) {
    return <Navigate to="/connexion" replace />;
  }

  // Vérifier que l'utilisateur a le rôle PROFESSIONNEL
  const roles = getRolesFromToken(token);
  if (!roles.some((role) => role.includes('PROFESSIONNEL'))) {
    return <Navigate to="/" replace />;
  }

  return <Header />;
}
