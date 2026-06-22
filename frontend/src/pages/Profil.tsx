import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from "react-i18next";
import {
  getLangues,
  getProfilUtilisateur,
  supprimerProfilUtilisateur,
  updateProfilUtilisateur,
  type ProfilUtilisateurData,
} from '../services/request';
import { getInputFieldClasses } from '../styles/fieldClasses';
import type { Langue } from '../types/Langue';
import ChangeLanguage from '../components/ChangeLanguage';


export default function Profil() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const hasAppliedInitialLanguage = useRef(false);
  const [profil, setProfil] = useState<ProfilUtilisateurData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreurChargement, setErreurChargement] = useState('');
  const [erreurFormulaire, setErreurFormulaire] = useState('');
  const [messageSucces, setMessageSucces] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [langues, setLangues] = useState<Langue[]>([]);
  const [langueId, setLangueId] = useState<number | ''>('');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [motDePasseActuel, setMotDePasseActuel] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');
  const [showModaleSuppressionCompte, setShowModaleSuppressionCompte] = useState(false);
  const modaleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const chargerProfil = async () => {
            try {
                const [donneesProfil, donneesLangues] = await Promise.all([
                  getProfilUtilisateur(),
                  getLangues().catch(() => []),
                ]);

                const languesDisponibles = Array.isArray(donneesLangues) ? (donneesLangues as Langue[]) : [];

                setProfil(donneesProfil);
                setLangues(languesDisponibles);
                setNom(donneesProfil.nom ?? '');
                setPrenom(donneesProfil.prenom ?? '');

                const preference = donneesProfil.preference;
                if (preference?.langueId) {
                  setLangueId(preference.langueId);
                } else if (languesDisponibles.length > 0) {
                  setLangueId(languesDisponibles[0].id);
                }

                if (preference?.langueCode && !hasAppliedInitialLanguage.current) {
                  hasAppliedInitialLanguage.current = true;
                  i18n.changeLanguage(preference.langueCode);
                }

                setDarkMode(preference?.theme === 'sombre');
                setNotifications(preference?.notifications ?? true);
            } catch (error: any) {
                if (error?.status === 401 || error?.status === 403) {
                    localStorage.removeItem('token');
                setErreurChargement('Votre session a expiré. Veuillez vous reconnecter.');
                    navigate('/connexion', { replace: true });
                    return;
                }

              setErreurChargement('Impossible de charger votre profil pour le moment.');
            } finally {
                setLoading(false);
            }
        };

        chargerProfil();
      }, [navigate]);

    useEffect(() => {
      document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    useEffect(() => {
      if (showModaleSuppressionCompte) {
        document.body.style.overflow = 'hidden';
        setTimeout(() => modaleRef.current?.focus(), 50);
      } else {
        document.body.style.overflow = '';
      }
      return () => { document.body.style.overflow = ''; };
    }, [showModaleSuppressionCompte]);

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formaterDate = (date: string | null): string => {
        if (!date) return 'Non renseignée';

        return new Date(date).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
      setErreurFormulaire('');
        setMessageSucces('');

        if (!nom.trim()) {
        setErreurFormulaire(t('main.profil.erreur_nom'));
          scrollToTop();
            return;
        }

        if (!prenom.trim()) {
        setErreurFormulaire(t('main.profil.erreur_prenom'));
          scrollToTop();
            return;
        }

        if (motDePasse && !motDePasseActuel.trim()) {
        setErreurFormulaire(t('main.profil.erreur_mot_de_passe_actuel_required'));
          scrollToTop();
            return;
        }

        if (motDePasse && motDePasse.length < 8) {
        setErreurFormulaire(t('main.profil.erreur_mot_de_passe_court'));
          scrollToTop();
            return;
        }

        if (motDePasse !== confirmationMotDePasse) {
        setErreurFormulaire(t('main.profil.erreur_mot_de_passe_confirmation'));
          scrollToTop();
            return;
        }

        setIsSaving(true);

        try {
            const profilMisAJour = await updateProfilUtilisateur({
                nom: nom.trim(),
                prenom: prenom.trim(),
                motDePasseActuel: motDePasseActuel || undefined,
                nouveauMotDePasse: motDePasse || undefined,
                preference: {
                  langueId: langueId === '' ? undefined : langueId,
                  theme: darkMode ? 'sombre' : 'clair',
                  notifications,
                },
            });

            setProfil(profilMisAJour);
            setMotDePasseActuel('');
            setMotDePasse('');
            setConfirmationMotDePasse('');
            setMessageSucces(t('main.profil.succes'));

            if (profilMisAJour.preference?.langueId) {
              setLangueId(profilMisAJour.preference.langueId);
            }
            if (profilMisAJour.preference?.langueCode) {
              i18n.changeLanguage(profilMisAJour.preference.langueCode);
            }
            setDarkMode(profilMisAJour.preference?.theme === 'sombre');
            setNotifications(profilMisAJour.preference?.notifications ?? notifications);
            scrollToTop();
        } catch (error: any) {
            if (error?.status === 401 || error?.status === 403) {
                localStorage.removeItem('token');
                navigate('/connexion', { replace: true });
                return;
            }

              setErreurFormulaire(error?.message || t('main.profil.erreur_mise_a_jour'));
              scrollToTop();
        } finally {
            setIsSaving(false);
        }
    };

    const handleSuppressionCompte = () => {
      setShowModaleSuppressionCompte(true);
    };

    const handleConfirmerSuppression = async () => {
      setShowModaleSuppressionCompte(false);
      setErreurFormulaire('');
      setMessageSucces('');
      setIsDeleting(true);

      try {
        await supprimerProfilUtilisateur();
        localStorage.removeItem('token');
        sessionStorage.setItem('flashMessageKey', 'main.profil.compte_supprime_succes');
        navigate('/', {
          replace: true,
          state: { flashMessageKey: 'main.profil.compte_supprime_succes' },
        });
      } catch (error: any) {
        if (error?.status === 401 || error?.status === 403) {
          localStorage.removeItem('token');
          navigate('/connexion', { replace: true });
          return;
        }

        setErreurFormulaire(error?.message || t('main.profil.erreur_suppression_compte'));
        scrollToTop();
      } finally {
        setIsDeleting(false);
      }
    };

          const handleDeconnexion = () => {
            localStorage.removeItem('token');
            navigate('/connexion', { replace: true });
          };

    if (loading) {
        return (
              <div className="min-h-screen p-4 pt-8 max-w-xl mx-auto">
                <p className="text-center text-gray-700">{t('main.profil.chargement')}</p>
            </div>
        );
    }

          if (erreurChargement) {
        return (
              <div className="min-h-screen p-4 pt-8 max-w-xl mx-auto">
                <div className="bg-red-100 text-red-800 p-4 rounded-xl text-center">{erreurChargement}</div>
            </div>
        );
    }

    if (!profil) {
        return null;
    }

    const prenomAffiche = profil.prenom ?? '';
    const nomAffiche = profil.nom ?? '';
    const initiales = `${prenomAffiche.charAt(0)}${nomAffiche.charAt(0)}`.trim().toUpperCase() || 'U';

    return (
      <div className="pt-24 px-4 profil-page">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 pb-10">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-[#22ACE2] text-white flex items-center justify-center text-3xl font-bold shadow-sm">
              {initiales}
            </div>
            <h1 className="mt-4 text-xl font-bold text-slate-800">{`${prenomAffiche} ${nomAffiche}`.trim() || profil.email}</h1>
            <p className="text-sm text-slate-500">{t('main.profil.membre_depuis')} {formaterDate(profil.dateCreation)}</p>
          </div>

          {messageSucces && (
            <div className="bg-green-100 text-green-800 p-4 rounded-xl text-center font-medium">
              {messageSucces}
            </div>
          )}

          {erreurFormulaire && (
            <div className="bg-red-100 text-red-800 p-4 rounded-xl text-center font-medium">
              {erreurFormulaire}
            </div>
          )}

          <Section title={t('main.profil.informations_compte')}>
            <InputField
              id="prenom"
              label={t('main.profil.prenom')}
              value={prenom}
              onChange={(event) => setPrenom(event.target.value)}
              placeholder={t('main.profil.prenom_placeholder')}
            />
            <InputField
              id="nom"
              label={t('main.profil.nom')}
              value={nom}
              onChange={(event) => setNom(event.target.value)}
              placeholder={t('main.profil.nom_placeholder')}
            />
            <InputField id="email" label={t('main.profil.email')} type="email" value={profil.email} readOnly />
          </Section>

          <Section title={t('main.profil.securite')}>
            <InputField
              id="currentPassword"
              label={t('main.profil.mot_de_passe_actuel')}
              type="password"
              value={motDePasseActuel}
              onChange={(event) => setMotDePasseActuel(event.target.value)}
              placeholder={t('main.profil.mot_de_passe_actuel_placeholder')}
            />
            <InputField
              id="password"
              label={t('main.profil.nouveau_mot_de_passe')}
              type="password"
              value={motDePasse}
              onChange={(event) => setMotDePasse(event.target.value)}
              placeholder={t('main.profil.nouveau_mot_de_passe_placeholder')}
            />
            <InputField
              id="confirmPassword"
              label={t('main.profil.confirmer_mot_de_passe')}
              type="password"
              value={confirmationMotDePasse}
              onChange={(event) => setConfirmationMotDePasse(event.target.value)}
              placeholder={t('main.profil.confirmer_mot_de_passe_placeholder')}
            />
          </Section>

          <Section title={t('main.profil.preferences')}>
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm font-semibold text-slate-700">{t('main.profil.langue')}</p>
                <p className="text-xs text-slate-400">{t('main.profil.langue_description')}</p>
              </div>
              <ChangeLanguage
                langues={langues}
                selectedLangueId={langueId}
                onSelectLangueId={setLangueId}
              />
            </div>
          </Section>

          <Section title={t('main.profil.compte')}>
            <DataRow label={t('main.profil.statut')} value={profil.statut} />
            <DataRow label={t('main.profil.compte_cree_le')} value={formaterDate(profil.dateCreation)} />
            <DataRow label={t('main.profil.derniere_connexion')} value={formaterDate(profil.dateDerniereConnexion)} />
          </Section>

          <Section title={t('main.profil.confidentialite_rgpd')}>
            <p id="rgpd-description" className="text-xs text-slate-500 leading-relaxed">
              {t('main.profil.rgpd_description')}
            </p>
            <button
              type="button"
              onClick={handleSuppressionCompte}
              disabled={isDeleting}
              aria-describedby="rgpd-description"
              className="w-full flex items-center justify-between p-3 border border-red-100 rounded-xl text-red-500 bg-red-50/30 hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="text-sm font-semibold">
                {isDeleting ? t('main.profil.suppression_compte_en_cours') : t('main.profil.supprimer_compte')}
              </span>
              <span aria-hidden="true" className="text-base">🗑</span>
            </button>
          </Section>

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#22ACE2] text-white py-4 rounded-xl font-semibold shadow-sm hover:bg-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? t('main.profil.enregistrement') : t('main.profil.enregistrer')}
            </button>
            <button
              type="button"
              onClick={handleDeconnexion}
              className="w-full bg-slate-50 text-slate-600 py-4 rounded-xl font-semibold border border-slate-100 hover:bg-slate-100 transition-colors"
            >
              {t('main.profil.deconnexion')}
            </button>
                </div>
        </form>

        {showModaleSuppressionCompte && (
          <div
            role="presentation"
            className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[60]"
            onClick={() => setShowModaleSuppressionCompte(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="suppression-compte-title"
              ref={modaleRef}
              tabIndex={-1}
              onKeyDown={(e) => e.key === 'Escape' && setShowModaleSuppressionCompte(false)}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md animate-slide-up"
            >
              <div className="flex items-start gap-3 p-5 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 id="suppression-compte-title" className="text-lg font-bold text-slate-800">
                    {t('main.profil.supprimer_compte')}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('main.profil.modale_suppression_avertissement')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 p-5">
                <button
                  type="button"
                  onClick={() => setShowModaleSuppressionCompte(false)}
                  className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-full text-sm transition-colors cursor-pointer"
                >
                  {t('main.profil.bouton_annuler')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmerSuppression}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-full text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? t('main.profil.suppression_compte_en_cours') : t('main.profil.bouton_confirmer_suppression')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  type SectionProps = {
    title: string;
    children: ReactNode;
  };

  function Section({ title, children }: SectionProps) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h2 className="font-bold text-slate-800 mb-4">{title}</h2>
        <div className="space-y-4">{children}</div>
      </div>
    );
  }

  type InputFieldProps = {
    id: string;
    label: string;
    value: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    readOnly?: boolean;
    placeholder?: string;
  };

  function InputField({ id, label, value, onChange, type = 'text', readOnly = false, placeholder }: InputFieldProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';
    const displayType = isPasswordField && showPassword ? 'text' : type;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase tracking-wide">
          {label}
        </label>
        <div className="relative">
          <input
            id={id}
            type={displayType}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            aria-readonly={readOnly}
            tabIndex={readOnly ? -1 : undefined}
            placeholder={placeholder}
            className={getInputFieldClasses(readOnly)}
          />
          {isPasswordField && !readOnly && (
            <button
              type="button"
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
              onTouchStart={() => setShowPassword(true)}
              onTouchEnd={() => setShowPassword(false)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    );
}

  type ToggleRowProps = {
    label: string;
    subLabel: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
  };

  function ToggleRow({ label, subLabel, enabled, onChange }: ToggleRowProps) {
    return (
      <div className="flex justify-between items-center py-2">
        <div>
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          <p className="text-xs text-slate-400">{subLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(!enabled)}
          className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-[#22ACE2]' : 'bg-slate-200'}`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'left-7' : 'left-1'}`}
          />
        </button>
      </div>
    );
  }

  type DataRowProps = {
    label: string;
    value: string;
  };

  function DataRow({ label, value }: DataRowProps) {
    return (
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-base font-semibold text-slate-900">{value}</p>
      </div>
    );
  }