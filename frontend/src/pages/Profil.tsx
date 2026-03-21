import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { getProfilUtilisateur, updateProfilUtilisateur, type ProfilUtilisateurData } from '../services/request';

export default function Profil() {
    const navigate = useNavigate();
    const [profil, setProfil] = useState<ProfilUtilisateurData | null>(null);
    const [loading, setLoading] = useState(true);
  const [erreurChargement, setErreurChargement] = useState('');
  const [erreurFormulaire, setErreurFormulaire] = useState('');
    const [messageSucces, setMessageSucces] = useState('');
    const [isSaving, setIsSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');

    useEffect(() => {
        const chargerProfil = async () => {
            try {
                const donneesProfil = await getProfilUtilisateur();
                setProfil(donneesProfil);
                setNom(donneesProfil.nom ?? '');
                setPrenom(donneesProfil.prenom ?? '');
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
        setErreurFormulaire('Le nom est requis.');
            return;
        }

        if (!prenom.trim()) {
        setErreurFormulaire('Le prénom est requis.');
            return;
        }

        if (motDePasse && motDePasse.length < 8) {
        setErreurFormulaire('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }

        if (motDePasse !== confirmationMotDePasse) {
        setErreurFormulaire('La confirmation du mot de passe ne correspond pas.');
            return;
        }

        setIsSaving(true);

        try {
            const profilMisAJour = await updateProfilUtilisateur({
                nom: nom.trim(),
                prenom: prenom.trim(),
                nouveauMotDePasse: motDePasse || undefined,
            });

            setProfil(profilMisAJour);
            setMotDePasse('');
            setConfirmationMotDePasse('');
            setMessageSucces('Vos informations ont été mises à jour.');
        } catch (error: any) {
            if (error?.status === 401 || error?.status === 403) {
                localStorage.removeItem('token');
                navigate('/connexion', { replace: true });
                return;
            }

              setErreurFormulaire(error?.message || 'Impossible de mettre à jour le profil.');
        } finally {
            setIsSaving(false);
        }
    };

          const handleDeconnexion = () => {
            localStorage.removeItem('token');
            navigate('/connexion', { replace: true });
          };

    if (loading) {
        return (
              <div className="min-h-screen p-4 pt-8 max-w-xl mx-auto">
                <p className="text-center text-gray-700">Chargement du profil...</p>
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

    const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.trim().toUpperCase() || 'U';

    return (
      <div className="bg-gray-50 flex justify-center p-4 profil-page">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 pb-10">
          <div className="flex flex-col items-center py-6">
            <div className="w-24 h-24 rounded-full bg-[#22ACE2] text-white flex items-center justify-center text-3xl font-bold shadow-sm">
              {initiales}
            </div>
            <h1 className="mt-4 text-xl font-bold text-slate-800">{`${prenom} ${nom}`.trim() || profil.email}</h1>
            <p className="text-sm text-slate-500">Membre depuis le {formaterDate(profil.dateCreation)}</p>
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

          <Section title="Informations du compte">
            <InputField
              id="prenom"
              label="Prénom"
              value={prenom}
              onChange={(event) => setPrenom(event.target.value)}
              placeholder="Votre prénom"
            />
            <InputField
              id="nom"
              label="Nom"
              value={nom}
              onChange={(event) => setNom(event.target.value)}
              placeholder="Votre nom"
            />
            <InputField id="email" label="Adresse e-mail" type="email" value={profil.email} readOnly />
          </Section>

          <Section title="Sécurité">
            <InputField
              id="password"
              label="Nouveau mot de passe"
              type="password"
              value={motDePasse}
              onChange={(event) => setMotDePasse(event.target.value)}
              placeholder="Laisser vide pour ne pas modifier"
            />
            <InputField
              id="confirmPassword"
              label="Confirmer le mot de passe"
              type="password"
              value={confirmationMotDePasse}
              onChange={(event) => setConfirmationMotDePasse(event.target.value)}
              placeholder="Confirmez le nouveau mot de passe"
            />
          </Section>

          <Section title="Préférences">
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm font-semibold text-slate-700">Langue</p>
                <p className="text-xs text-slate-400">Langue d&apos;affichage de l&apos;application</p>
              </div>
              <select defaultValue="Français" className="text-sm border border-slate-200 rounded-md p-1 bg-white outline-none">
                <option>Français</option>
                <option>English (US)</option>
              </select>
            </div>
            <ToggleRow
              label="Thème sombre"
              subLabel="Basculer entre le mode clair et sombre"
              enabled={darkMode}
              onChange={setDarkMode}
            />
            <ToggleRow
              label="Notifications Push"
              subLabel="Mises à jour des commandes et promos"
              enabled={notifications}
              onChange={setNotifications}
            />
          </Section>

          <Section title="Compte">
            <DataRow label="Statut" value={profil.statut} />
            <DataRow label="Compte créé le" value={formaterDate(profil.dateCreation)} />
            <DataRow label="Dernière connexion" value={formaterDate(profil.dateDerniereConnexion)} />
          </Section>

          <Section title="Confidentialité & RGPD">
            <p id="rgpd-description" className="text-xs text-slate-500 leading-relaxed">
              Gérez vos données et vos paramètres de confidentialité. Vous pouvez demander la suppression de votre compte.
            </p>
            <button
              type="button"
              aria-describedby="rgpd-description"
              className="w-full flex items-center justify-between p-3 border border-red-100 rounded-xl text-red-500 bg-red-50/30 hover:bg-red-50 transition-colors"
            >
              <span className="text-sm font-semibold">Supprimer le compte</span>
              <span aria-hidden="true" className="text-base">🗑</span>
            </button>
          </Section>

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#22ACE2] text-white py-4 rounded-xl font-semibold shadow-sm hover:bg-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
            <button
              type="button"
              onClick={handleDeconnexion}
              className="w-full bg-slate-50 text-slate-600 py-4 rounded-xl font-semibold border border-slate-100 hover:bg-slate-100 transition-colors"
            >
              Déconnexion
            </button>
                </div>
        </form>
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
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase tracking-wide">
          {label}
        </label>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          placeholder={placeholder}
          className="w-full p-3 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-[#22ACE2] focus:border-transparent outline-none transition-all read-only:bg-slate-50 read-only:text-slate-500"
        />
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