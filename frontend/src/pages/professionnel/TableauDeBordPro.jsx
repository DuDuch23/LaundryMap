import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import API_BASE_URL, { uploadPath, resolveUrl } from '../../services/api';
import Notification from '../../components/Notification';

const statusStyles = {
  'Validée': 'bg-emerald-500 text-white',
  'En attente': 'bg-amber-500 text-white',
  'Refusée': 'bg-rose-500 text-white',
};

const statusLabels = {
  'Validée': 'Validée',
  'En attente': 'En attente',
  'Refusée': 'Refusée',
};

const fallbackLaverieImage = uploadPath('/uploads/laveries/default-laundry.jpg');

function MessageCircleIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.8235 20 9.6984 19.7896 8.66667 19.4028L4 21L5.59722 16.3333C5.2104 15.3016 5 14.1765 5 13C5 8.02944 8.80558 4 13.5 4C17.6421 4 21 7.35786 21 11.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.5 11.5H15.5M8.5 14.5H12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

export default function TableauDeBordPro() {
  const profilePhotoInputRef = useRef(null);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [removingProfilePhoto, setRemovingProfilePhoto] = useState(false);

  useEffect(() => {
    const fetchTableauBord = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vous devez être connecté');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/professionnel/tableau-bord`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchTableauBord();
  }, []);

  const handleDeleteLaverie = async (laverieId) => {
    setDeleting(laverieId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/professionnel/laveries/${laverieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotification({
          type: 'success',
          message: 'Laverie supprimée avec succès',
        });
        
        // Mise à jour immédiate de l'état local pour retirer la laverie
        setData(prev => {
          if (!prev) return prev;
          const removedLaverie = prev.laveries.find(l => l.id === laverieId);
          return {
            ...prev,
            laveries: prev.laveries.filter(l => l.id !== laverieId),
            stats: {
              ...prev.stats,
              total: Math.max(0, prev.stats.total - 1),
              validees: removedLaverie?.statut === 'Validée' ? Math.max(0, prev.stats.validees - 1) : prev.stats.validees,
              en_attente: removedLaverie?.statut === 'En attente' ? Math.max(0, prev.stats.en_attente - 1) : prev.stats.en_attente,
              refusees: removedLaverie?.statut === 'Refusée' ? Math.max(0, prev.stats.refusees - 1) : prev.stats.refusees,
            }
          };
        });

        // Masquer la notification après 3 secondes
        setTimeout(() => setNotification(null), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setNotification({
          type: 'error',
          message: errorData.message || 'Erreur lors de la suppression de la laverie',
        });
      }
    } catch (err) {
      console.error('Erreur:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Une erreur est survenue',
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleOpenProfilePhotoPicker = () => {
    profilePhotoInputRef.current?.click();
  };

  const handleProfilePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setUploadingProfilePhoto(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vous devez être connecté');
      }

      const payload = new FormData();
      payload.append('photoProfil', file);

      const response = await fetch(`${API_BASE_URL}/api/profil/photo-profil`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(responseData.erreur || 'Impossible de mettre à jour la photo de profil');
      }

      setData((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          professionnel: {
            ...prev.professionnel,
            photoProfil: responseData.photoProfil || prev.professionnel?.photoProfil || null,
          },
        };
      });

      setNotification({
        type: 'success',
        message: 'Photo de profil mise à jour',
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (uploadError) {
      setNotification({
        type: 'error',
        message: uploadError.message || 'Une erreur est survenue lors de la mise à jour de la photo',
      });
    } finally {
      setUploadingProfilePhoto(false);
      event.target.value = '';
    }
  };

  const handleRemoveProfilePhoto = async () => {
    if (!photoProfilUrl) {
      return;
    }

    try {
      setRemovingProfilePhoto(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vous devez être connecté');
      }

      const response = await fetch(`${API_BASE_URL}/api/profil/photo-profil`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(responseData.erreur || 'Impossible de supprimer la photo de profil');
      }

      setData((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          professionnel: {
            ...prev.professionnel,
            photoProfil: null,
          },
        };
      });

      setNotification({
        type: 'success',
        message: 'Photo de profil supprimée',
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (removeError) {
      setNotification({
        type: 'error',
        message: removeError.message || 'Une erreur est survenue lors de la suppression de la photo',
      });
    } finally {
      setRemovingProfilePhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 pt-24">
        <main className="flex-1" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 pt-24">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-red-600">{error || 'Erreur lors du chargement'}</div>
        </main>
      </div>
    );
  }

  const { professionnel, stats, laveries } = data;
  const prenom = (professionnel?.prenom || '').trim();
  const nom = (professionnel?.nom || '').trim();
  const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || 'U';
  const photoProfilUrl = professionnel?.photoProfil || null;

  const getImageUrl = (relativePath) => {
    if (!relativePath) return fallbackLaverieImage;
    return resolveUrl(relativePath);
  };

  const getLaverieImage = (laverie) => getImageUrl(laverie?.image || laverie?.logo?.emplacement);
  const getLaverieImageAlt = (laverie) => laverie?.imageAlt || laverie?.logo?.alt || laverie?.nom || 'Laverie';
  const getCommentairesCount = (laverie) => Number(laverie?.commentairesCount ?? 0);
  const getNoteMoyenne = (laverie) => {
    const value = Number(laverie?.noteMoyenne ?? 0);
    return Number.isFinite(value) ? value.toFixed(1) : '0.0';
  };

  const notesMoyennes = (Array.isArray(laveries) ? laveries : [])
    .map((laverie) => Number(laverie?.noteMoyenne))
    .filter((note) => Number.isFinite(note) && note > 0);
  const moyenneCompte = notesMoyennes.length > 0
    ? notesMoyennes.reduce((sum, note) => sum + note, 0) / notesMoyennes.length
    : 0;
  const moyenneCompteAffichee = moyenneCompte.toFixed(1);
  const etoilesRemplies = Math.round(moyenneCompte);
  const commentairesTotal = (Array.isArray(laveries) ? laveries : []).reduce(
    (sum, laverie) => sum + Number(laverie?.commentairesCount ?? 0),
    0,
  );

  return (
    <div className="flex w-full flex-col bg-slate-50 pt-24">
      {/* Toast Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <main className="flex-1 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1280px] bg-gray-50 pb-16">
          {/* Section profil */}
          <section className="overflow-hidden rounded-[28px] bg-gradient-to-b from-cyan-500 to-cyan-600 text-white shadow-md">
            <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
              <div className="relative">
                <input
                  ref={profilePhotoInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.gif,image/*"
                  className="hidden"
                  onChange={handleProfilePhotoChange}
                />
                {photoProfilUrl ? (
                  <img
                    src={photoProfilUrl}
                    alt={`${professionnel.prenom} ${professionnel.nom}`}
                    className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-cyan-700 text-3xl font-bold text-white shadow-lg">
                    {initiales}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleOpenProfilePhotoPicker}
                  disabled={uploadingProfilePhoto || removingProfilePhoto}
                  className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-cyan-600 text-white shadow-md transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Modifier la photo de profil"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm17.71-10.04a1.003 1.003 0 000-1.42l-2.5-2.5a1.003 1.003 0 00-1.42 0l-1.96 1.96 3.75 3.75 2.13-1.79z" />
                  </svg>
                </button>
                {photoProfilUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveProfilePhoto}
                    disabled={uploadingProfilePhoto || removingProfilePhoto}
                    className="absolute -bottom-1 -left-1 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-white shadow-md transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Supprimer la photo de profil"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d="M19 13H5v-2h14v2z" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg leading-none ${i < etoilesRemplies ? 'text-yellow-300' : 'text-white/40'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-xs font-medium text-white/95">{moyenneCompteAffichee} / 5</p>
                <p className="text-xs opacity-90">{commentairesTotal} commentaires</p>
                <h1 className="text-xl font-semibold sm:text-2xl">
                  {professionnel.prenom} {professionnel.nom}
                </h1>
              </div>
            </div>
          </section>

          {/* Section statistiques */}
          <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-white p-3 shadow-sm sm:p-4">
              <p className="text-xs text-slate-500 sm:text-sm">Total</p>
              <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{stats.total}</p>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm sm:p-4">
              <p className="text-xs text-slate-500 sm:text-sm">Validées</p>
              <p className="mt-1 text-xl font-bold text-emerald-600 sm:text-2xl">
                {stats.validees}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm sm:p-4">
              <p className="text-xs text-slate-500 sm:text-sm">Attente</p>
              <p className="mt-1 text-xl font-bold text-amber-600 sm:text-2xl">{stats.en_attente}</p>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm sm:p-4">
              <p className="text-xs text-slate-500 sm:text-sm">Refusées</p>
              <p className="mt-1 text-xl font-bold text-rose-600 sm:text-2xl">{stats.refusees}</p>
            </div>
          </section>

          {/* Section laveries */}
          <section className="mt-8 text-center">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Vos laveries</h2>
              <Link
                to="/professionnel/nouvelle-laverie"
                className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
              >
                + Ajouter
              </Link>
            </div>

            <div className="grid w-full w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {laveries && laveries.map((laundry) => (
                <article
                  key={laundry.id}
                  onClick={() => navigate(`/laveries/${laundry.id}`)}
                  className="w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm transition hover:shadow-md cursor-pointer"
                >
                  <div className="relative h-40 w-full bg-slate-200">
                    <img
                      src={getLaverieImage(laundry)}
                      alt={getLaverieImageAlt(laundry)}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                    />
                    <span
                      className={`absolute right-4 top-4 z-10 rounded-lg px-4 py-2 text-sm font-bold shadow-lg ${statusStyles[laundry.statut] || 'bg-slate-500 text-white'}`}
                    >
                      {statusLabels[laundry.statut] || 'Inconnu'}
                    </span>
                    <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                      <MessageCircleIcon className="h-3.5 w-3.5" />
                      {getCommentairesCount(laundry)} commentaire{getCommentairesCount(laundry) > 1 ? 's' : ''}
                    </span>
                    <span className="absolute left-4 bottom-4 z-10 inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-lg backdrop-blur-sm">
                      <StarIcon className="h-3.5 w-3.5" />
                      {getNoteMoyenne(laundry)} / 5
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-bold text-slate-900">{laundry.nom}</h3>
                    <p className="mt-1 text-xs text-slate-600 sm:text-sm">{laundry.adresse}</p>

                    <div className="mt-4 space-y-1 text-xs text-slate-500">
                      <p>
                        <span className="font-semibold">Créée :</span> {laundry.dateAjout}
                      </p>
                      <p>
                        <span className="font-semibold">Modifiée :</span> {laundry.dateModification}
                      </p>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        to={`/professionnel/laveries/${laundry.id}/modifier`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 rounded-xl bg-cyan-500 px-3 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm"
                      >
                        Modifier
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLaverie(laundry.id);
                        }}
                        disabled={deleting === laundry.id}
                        className="flex-1 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm cursor-pointer"
                      >
                        {deleting === laundry.id ? 'Suppression...' : 'Supprimer'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {(!laveries || laveries.length === 0) && (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-600">Aucune laverie pour le moment</p>
              </div>
            )}

            <div className="mt-6 flex flex-col items-center gap-3">
              <Link
                to="/professionnel/nouvelle-laverie"
                className="block w-full max-w-xl rounded-xl border-2 border-cyan-500 px-4 py-3 text-center text-sm font-semibold text-cyan-600 transition hover:bg-cyan-50"
              >
                Ajouter une laverie
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
