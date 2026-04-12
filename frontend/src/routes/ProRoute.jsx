import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import Header from '../components/Header';
import API_BASE_URL from '../services/api';

export default function ProRoute() {
  const token = localStorage.getItem('token');
  const [isChecking, setIsChecking] = useState(true);
  const [isValidatedPro, setIsValidatedPro] = useState(false);

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

  const roles = token ? getRolesFromToken(token) : [];
  const hasProRole = roles.some((role) => role.includes('PROFESSIONNEL'));

  useEffect(() => {
    let isMounted = true;

    const verifyProfessionnelValidation = async () => {
      if (!token || !hasProRole) {
        if (isMounted) {
          setIsValidatedPro(false);
          setIsChecking(false);
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/professionnel/tableau-bord`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!isMounted) {
          return;
        }

        setIsValidatedPro(response.ok);
      } catch (error) {
        if (isMounted) {
          setIsValidatedPro(false);
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    verifyProfessionnelValidation();

    return () => {
      isMounted = false;
    };
  }, [token, hasProRole]);

  if (!token) {
    return <Navigate to="/connexion" replace />;
  }

  if (!hasProRole) {
    return <Navigate to="/" replace />;
  }

  if (isChecking) {
    return <div className="min-h-screen w-full bg-slate-50" />;
  }

  if (!isValidatedPro) {
    return <Navigate to="/connexion" replace />;
  }

  return <Header />;
}
