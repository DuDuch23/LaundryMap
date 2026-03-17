import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { AccessibleInput, AccessibleButton } from "../components/accessibility";
import { connexion } from "../services/request";
import API_BASE_URL from "../services/api";

export default function PageConnexion() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [erreurGenerale, setErreurGenerale] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const oauthError = params.get("error");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/profil", { replace: true });
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

    if (!email.trim()) newsErrors.email = "L'email est requis";
    if (!password.trim()) newsErrors.password = "Le mot de passe est requis";

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
        navigate("/profil", { replace: true });
        return;
      }

      setErreurGenerale("Réponse de connexion invalide.");
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setErreurGenerale("Email ou mot de passe incorrect.");
      } else {
        setErreurGenerale("Impossible de se connecter au serveur.");
      }
    }
  };

  const handleGoogleSSO = () => {
    window.location.href = `${API_BASE_URL}/api/oauth/google/redirect`;
  };

  return (
    <div className="p-4 pt-8 max-w-md mx-auto flex flex-col items-center">
      <h1 className="text-2xl font-bold text-[#22ACE2] mb-8 text-center w-full">
        Connexion
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
        className="w-full flex flex-col items-center"
      >
        <div className="w-full text-left">
          <AccessibleInput
            id="email"
            className={"flex flex-col mb-4"}
            label={"Email"}
            type="email"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            placeholder={"Ex: jean.dupont@email.com"}
            error={errors.email}
          />
        </div>

        <div className="relative mb-8 w-full text-left">
          <div className="absolute right-0 top-0 z-1">
            <Link
              to="/mot-de-passe-oublie"
              className="text-sm text-[#22ACE2] hover:text-blue-600 hover:underline font-medium transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <AccessibleInput
            id="password"
            className={"flex flex-col"}
            label={"Mot de passe"}
            type="password"
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            placeholder={"••••••••••••"}
            error={errors.password}
          />
        </div>

        <AccessibleInput
          id="submit"
          label={false}
          type="submit"
          className="bg-[#22ACE2] w-full font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-sm cursor-pointer text-center"
          value="Se connecter"
          onChange={false}
          error={false}
          placeholder="Se connecter"
        />

        <div className="flex items-center w-full my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 text-sm font-medium">ou</span>
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
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t("main.inscription_utilisateur.continuer_avec_google")}
            </div>
          </AccessibleButton>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <Link
            to="/inscription-utilisateur"
            className="text-[#22ACE2] font-bold hover:underline"
          >
            S'inscrire
          </Link>
        </div>
      </form>
    </div>
  );
}
