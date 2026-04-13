import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { AccessibleInput, AccessibleButton } from "../components/accessibility";
import { connexion } from "../services/request";
import API_BASE_URL from "../services/api";

// Fonction utilitaire pour décoder le token JWT et récupérer les rôles
function getRolesFromToken(token: string): string[] {
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
}

export default function PageConnexion() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [erreurGenerale, setErreurGenerale] = useState<string>("");
  const [messageSucces, setMessageSucces] = useState<string>("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hash);

    const token = hashParams.get("token") ?? searchParams.get("token");
    const oauthError = hashParams.get("error") ?? searchParams.get("error");

    if (token) {
      localStorage.setItem("token", token);

      // Redirection dynamique selon le rôle (SSO)
      const roles = getRolesFromToken(token);
      if (roles.some((role) => role.includes("ADMIN"))) {
        navigate("/admin/tableau-de-bord", { replace: true });
      } else if (roles.some((role) => role.includes("PROFESSIONNEL"))) {
        navigate("/professionnel/tableau-de-bord", { replace: true });
      } else {
        navigate("/profil", { replace: true });
      }

      return;
    }

    if (oauthError) {
      setErreurGenerale(t("main.connexion.google_erreur"));
      navigate("/connexion", { replace: true });
    }
  }, [navigate, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErreurGenerale("");

    const newsErrors: Record<string, string> = {};

    if (!email.trim()) newsErrors.email = t("main.connexion.email_requis");
    if (!password.trim()) newsErrors.password = t("main.connexion.mot_de_passe_requis");

    if (Object.keys(newsErrors).length > 0) {
      setErrors(newsErrors);
      return;
    }

    //APPEL API POUR LA CONNEXION
    try {
      const resultat = await connexion({
        email: email,
        mot_de_passe: password,
      });
      if (resultat?.token) {
        localStorage.setItem("token", resultat.token);

        setErrors({});
        setErreurGenerale("");
        setMessageSucces("");

        // Redirection dynamique selon le rôle (Connexion classique)
        const roles = getRolesFromToken(resultat.token);
        if (roles.some((role) => role.includes("ADMIN"))) {
          navigate("/admin/gestion-utilisateurs", { replace: true });
        } else if (roles.some((role) => role.includes("PROFESSIONNEL"))) {
          navigate("/professionnel/tableau-de-bord", { replace: true });
        } else {
          navigate("/profil", { replace: true });
        }
        return;
      }

      setErreurGenerale("Réponse de connexion invalide.");
    } catch (error: any) {
      if (error.response?.status === 401) {
        const serverMessage = error.response.data?.message;

        if (serverMessage === 'ACCOUNT_REFUSED') {
          setErreurGenerale(t("main.connexion.erreur_compte_refuse") as string);
        } 
        else if (serverMessage === 'ACCOUNT_BANNED') {
          setErreurGenerale(t("main.connexion.erreur_compte_banni") as string);
        } 
        else if (serverMessage === 'ACCOUNT_PENDING') {
          setErreurGenerale(t("main.connexion.erreur_compte_en_attente") as string);
        } 
        else if (serverMessage === 'Invalid credentials.') {
          setErreurGenerale(t("main.connexion.mot_de_passe_invalid") as string);
        } 
        else {
          setErreurGenerale(serverMessage || (t("main.connexion.erreur_generique") as string));
        }
      } 
      else if (!error.response) {
        setErreurGenerale(t("main.connexion.erreur_reseau") as string);
      } 
      else {
        setErreurGenerale(t("main.connexion.erreur_generique") as string);
      }
    }
  };

  const handleGoogleSSO = () => {
    window.location.href = `${API_BASE_URL}/api/oauth/google/redirect`;
  };

  return (
    <div className="w-full pt-24 sm:px-6 lg:px-8 !box-border px-4 pb-16 max-w-[500px]">
      <h1 className="text-2xl font-bold text-[#22ACE2] mb-2 text-center w-full">
        {t("main.connexion.connexion")}
      </h1>

      {erreurGenerale && (
        <div
          role="alert"
          className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 text-center font-medium w-full"
        >
          {erreurGenerale}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center gap-5 !box-border"
      >
        <div className="w-full text-left">
          <AccessibleInput
            id="email"
            name="email"
            className={"flex flex-col"}
            label={"Email"}
            type="email"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            placeholder={"Ex: jean.dupont@email.com"}
            error={errors.email}
          />
        </div>

        <div className="relative mb-8 w-full text-left">

          <AccessibleInput
            id="password"
            name="password"
            className={"flex flex-col"}
            label={t("main.connexion.mot_de_passe")}
            type="password"
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            placeholder={"••••••••••••"}
            error={errors.password}
          />
          <div className="right-0 top-0 z-1">
            <Link
              to="/mot-de-passe-oublie"
              className="text-sm text-[#22ACE2] hover:text-blue-600 hover:underline font-medium transition-colors"
            >
              {t("main.connexion.mot_de_passe_oublie")}
            </Link>
          </div>
        </div>

        <AccessibleInput
          id="submit"
          name="submit"
          label={false}
          type="submit"
          className="bg-[#22ACE2] w-full font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-sm cursor-pointer text-center"
          value={t("main.connexion.se_connecter")}
          onChange={false}
          error={false}
          placeholder={t("main.connexion.se_connecter")}
        />

        <div className="flex items-center w-full">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 text-sm font-medium">{t("main.connexion.ou")}</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="w-full box-border">
          <AccessibleButton
            type="button"
            className="w-full"
            ariaLabel={t("main.inscription_utilisateur.continuer_avec_google")}
            onClick={handleGoogleSSO}
          >
            <div className="box-border flex items-center justify-center bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer mb-2">
              <svg
                className="w-5 h-5 mr-3"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-sm font-medium">{t("main.inscription_utilisateur.continuer_avec_google")}</span>
            </div>
          </AccessibleButton>
        </div>
      </form>
    </div>
  );
}