import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AccessibleInput, AccessibleButton } from "../components/accessibility";
import { inscriptionUtilisateur } from "../services/request";
import API_BASE_URL from "../services/api";

export default function RegisterUser() {
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [cguAccepted, setCguAccepted] = useState<boolean>(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [messageSucces, setMessageSucces] = useState<string>("");

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]{12,}$/;

  const handleChangeFirstName = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFirstName(e.target.value);
  const handleChangeLastName = (e: React.ChangeEvent<HTMLInputElement>) =>
    setLastName(e.target.value);
  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEmail(e.target.value);
  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value);
  const handleChangeConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) =>
    setConfirmPassword(e.target.value);
  const handleChangeCgu = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCguAccepted(e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newsErrors: Record<string, string> = {};
    setMessageSucces("");

    //VALIDATION FRONTEND
    if (!firstName.trim()) {
      newsErrors.firstName = t("main.inscription_utilisateur.prenom_requis");
    } else if (firstName.trim().length < 2) {
      newsErrors.firstName = t(
        "main.inscription_utilisateur.prenom_trop_court",
      );
    }
    else if (firstName.trim().length > 50) {
      newsErrors.firstName = t("main.inscription_utilisateur.prenom_trop_long");
    }

    if (!lastName.trim()) {
      newsErrors.lastName = t("main.inscription_utilisateur.nom_requis");
    } else if (lastName.trim().length < 2) {
      newsErrors.lastName = t("main.inscription_utilisateur.nom_trop_court");
    } else if (lastName.trim().length > 50) {
      newsErrors.lastName = t("main.inscription_utilisateur.nom_trop_long");
    }
    

    if (!password.trim()) {
      newsErrors.password = t(
        "main.inscription_utilisateur.mot_de_passe_requis",
      );
    } else if (!passwordRegex.test(password)) {
      newsErrors.password = t(
        "main.inscription_utilisateur.mot_de_passe_invalide",
      );
    }

    if (!confirmPassword.trim()) {
      newsErrors.confirmPassword = t("main.inscription_utilisateur.confirmation_mot_de_passe_requise");
    } else if (password !== confirmPassword) {
      newsErrors.confirmPassword = t("main.inscription_utilisateur.mots_de_passe_differents");
    }

    if (!email.trim()) {
      newsErrors.email = t("main.inscription_utilisateur.email_requis");
    } else if (!emailRegex.test(email)) {
      newsErrors.email = t("main.inscription_utilisateur.email_invalid");
    }

    if (!cguAccepted) {
      newsErrors.cguAccepted = t(
        "main.inscription_utilisateur.conditions_requis",
      );
    }

    if (Object.keys(newsErrors).length > 0) {
      setErrors(newsErrors);
      return;
    }

    setErrors({});

    //APPEL API
    try {
      const resultat = await inscriptionUtilisateur({
        prenom: firstName,
        nom: lastName,
        email: email,
        motDePasse: password,
      });
      setMessageSucces(t("main.inscription_utilisateur.succes"));
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setCguAccepted(false);
    } catch (error: any) {
      console.error("Erreur lors de l'inscription :", error);

      if (error.response?.data?.erreurs) {
        const backendErrors = error.response.data.erreurs;

        // Mapping clés backend -> clés frontend
        const keyMap: Record<string, string> = {
          nom: 'lastName',
          prenom: 'firstName',
          email: 'email',
          motDePasse: 'password',
        };

        // Mapping codes erreur backend -> clés i18n
        const messageMap: Record<string, string> = {
          ERROR_LASTNAME_TOO_LONG: t("main.inscription_utilisateur.nom_trop_long"),
          ERROR_FIRSTNAME_TOO_LONG: t("main.inscription_utilisateur.prenom_trop_long"),
        };

        const mappedErrors: Record<string, string> = {};
        for (const [backendKey, message] of Object.entries(backendErrors)) {
          const frontKey = keyMap[backendKey] || backendKey;
          mappedErrors[frontKey] = messageMap[message as string] || (message as string);
        }

        setErrors(mappedErrors);
      }
      else if (error.response?.data?.message) {
        setErrors({ global: error.response.data.message });
      }
      else if (!error.response) {
        setErrors({
          global: t("main.connexion.erreur_reseau")
        });
      }
      else {
        setErrors({
          global: t("main.connexion.erreur_generique"),
        });
      }
    }
  };

  const handleGoogleSSO = () => {
    window.location.href = `${API_BASE_URL}/api/oauth/google/redirect`;
  };

  return (
    <div className="pt-24 px-4 w-full pb-16">
      <h1 className="text-2xl font-bold text-[#22ACE2] mb-2 text-center w-full">
        {t("main.inscription_utilisateur.titre")}
      </h1>

      {messageSucces && (
        <div
          role="status"
          className="bg-green-100 text-green-800 p-4 rounded-lg mb-6 text-center font-bold"
        >
          {messageSucces}
        </div>
      )}

      {errors.global && (
        <div
          role="alert"
          className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 text-center"
        >
          {errors.global}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        <AccessibleInput
          id="prenom"
          className={"flex flex-col"}
          label={t("main.inscription_utilisateur.prenom")}
          type="text"
          value={firstName}
          onChange={handleChangeFirstName}
          placeholder={t("main.inscription_utilisateur.placeholder_prenom")}
          error={errors.firstName}
          maxLength={50}
        />

        <AccessibleInput
          id="nom"
          className={"flex flex-col"}
          label={t("main.inscription_utilisateur.nom")}
          type="text"
          value={lastName}
          onChange={handleChangeLastName}
          placeholder={t("main.inscription_utilisateur.placeholder_nom")}
          error={errors.lastName}
          maxLength={50}
        />

        <AccessibleInput
          id="email"
          className={"flex flex-col"}
          label={t("main.inscription_utilisateur.email")}
          type="email"
          value={email}
          onChange={handleChangeEmail}
          placeholder={t("main.inscription_utilisateur.placeholder_email")}
          error={errors.email}
        />

        <AccessibleInput
          id="password"
          className={"flex flex-col"}
          label={t("main.inscription_utilisateur.mot_de_passe")}
          type="password"
          value={password}
          onChange={handleChangePassword}
          placeholder={t(
            "main.inscription_utilisateur.placeholder_mot_de_passe",
          )}
          error={errors.password}
        />

        <AccessibleInput
          id="confirmPassword"
          className={"flex flex-col mb-2"}
          label={t("main.inscription_utilisateur.confirmer_mot_de_passe")}
          type="password"
          value={confirmPassword}
          onChange={handleChangeConfirmPassword}
          placeholder={t(
            "main.inscription_utilisateur.placeholder_mot_de_passe",
          )}
          error={errors.confirmPassword}
        />

        <ul className="text-xs text-gray-600 mb-6 pl-2 space-y-1">
          <li style={{ color: password.length >= 12 ? "green" : "red" }}>
            ✓ {t("main.inscription_utilisateur.mot_de_passe_caractere_minimum")}
          </li>
          <li style={{ color: /[A-Z]/.test(password) ? "green" : "red" }}>
            ✓ {t("main.inscription_utilisateur.une_majuscule")}
          </li>
          <li style={{ color: /[a-z]/.test(password) ? "green" : "red" }}>
            ✓ {t("main.inscription_utilisateur.une_minuscule")}
          </li>
          <li style={{ color: /\d/.test(password) ? "green" : "red" }}>
            ✓ {t("main.inscription_utilisateur.un_chiffre")}
          </li>
          <li style={{ color: /[@$!%*?&^#]/.test(password) ? "green" : "red" }}>
            ✓ {t("main.inscription_utilisateur.un_caractere_special")}
          </li>
        </ul>

        <AccessibleInput
          id="cgu"
          label={t("main.inscription_utilisateur.accepte_condition")}
          type="checkbox"
          className={'flex flex-row-reverse justify-end'}
          value={cguAccepted.toString()}
          onChange={handleChangeCgu}
          error={errors.cguAccepted}
          placeholder=""
        />
        <AccessibleInput
          id="submit"
          label={false}
          type="submit"
          className="bg-[#22ACE2] w-full font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-sm cursor-pointer text-center"
          value="S'inscrire"
          onChange={false}
          error={false}
          placeholder="S'inscrire"
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
      </form>
    </div>
  );
}