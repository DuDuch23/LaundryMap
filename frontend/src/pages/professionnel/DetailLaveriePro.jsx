import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, CalendarDays, Mail, MessageCircle, Star } from 'lucide-react';
import API_BASE_URL from '../../services/api';

const fallbackLaverieImage = 'https://picsum.photos/seed/laundry-detail-fallback/1600/900';

export default function DetailLaveriePro() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [laverie, setLaverie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLaverie = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vous devez être connecté');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/professionnel/laveries/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.erreur || 'Impossible de charger la laverie.');
        }

        const data = await response.json();
        setLaverie(data);
      } catch (fetchError) {
        setError(fetchError.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchLaverie();
  }, [id]);

  const getImage = () => laverie?.image || fallbackLaverieImage;
  const getCommentairesCount = () => Number(laverie?.commentairesCount ?? 0);
  const getNoteMoyenne = () => {
    const value = Number(laverie?.noteMoyenne ?? 0);
    return Number.isFinite(value) ? value.toFixed(1) : '0.0';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 pt-24 text-sm font-semibold text-slate-600">
        Chargement de la laverie...
      </div>
    );
  }

  if (error || !laverie) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 pt-24 px-4">
        <div className="max-w-md rounded-3xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-rose-600">{error || 'Laverie introuvable'}</p>
          <button
            type="button"
            onClick={() => navigate('/professionnel/tableau-de-bord')}
            className="mt-4 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 pt-24">
      <main className="flex-1 px-4 pb-8">
        <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-sm">
          <div className="relative h-64 w-full bg-slate-200">
            <img
              src={getImage()}
              alt={laverie.imageAlt || laverie.nom}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg backdrop-blur-sm transition hover:bg-white"
              aria-label="Retour"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-3 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                  {laverie.statut}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {getCommentairesCount()} commentaire{getCommentairesCount() > 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-900">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {getNoteMoyenne()} / 5
                </span>
              </div>
              <h1 className="text-2xl font-bold sm:text-3xl">{laverie.nom}</h1>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Adresse</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{laverie.adresse}</p>
                <p className="mt-1 text-sm text-slate-600">{laverie.codePostal} {laverie.ville}</p>
                {laverie.pays && <p className="mt-1 text-sm text-slate-600">{laverie.pays}</p>}
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</p>
                <div className="mt-2 space-y-2 text-sm text-slate-700">
                  {laverie.email ? (
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-cyan-500" />
                      {laverie.email}
                    </p>
                  ) : (
                    <p>Email non renseigné</p>
                  )}
                  {laverie.wiLineReference ? (
                    <p className="flex items-center gap-2">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white">W</span>
                      Référence WI-LINE {laverie.wiLineReference}
                    </p>
                  ) : (
                    <p>Pas de connexion WI-LINE</p>
                  )}
                </div>
              </div>
            </section>

            {laverie.description && (
              <section className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{laverie.description}</p>
              </section>
            )}

            {Array.isArray(laverie.horaires) && laverie.horaires.length > 0 && (
              <section className="rounded-2xl bg-slate-50 p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <CalendarDays className="h-4 w-4" />
                  Horaires
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {laverie.horaires.map((horaire) => (
                    <div key={horaire.jour} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                      <span className="font-semibold capitalize">{horaire.jour}</span>
                      <span className="ml-2 text-slate-500">
                        {horaire.ferme ? 'Fermé' : `${horaire.debut} - ${horaire.fin}`}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {Array.isArray(laverie.images) && laverie.images.length > 0 && (
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Galerie</p>
                  <span className="text-xs text-slate-500">{laverie.images.length} image{laverie.images.length > 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {laverie.images.map((image) => (
                    <a
                      key={image.id}
                      href={image.image}
                      target="_blank"
                      rel="noreferrer"
                      className="overflow-hidden rounded-2xl bg-slate-100 shadow-sm transition hover:shadow-md"
                    >
                      <img src={image.image} alt={image.alt || laverie.nom} className="h-32 w-full object-cover" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/professionnel/laveries/${laverie.id}/modifier`}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
              >
                Modifier la laverie
              </Link>
              <Link
                to="/professionnel/tableau-de-bord"
                className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Retour au tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
