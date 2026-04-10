import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import Header from '../../components/Header';
import Footer from '../../components/Footer/footer';
import API_BASE_URL from '../../services/api';

const statusStyles = {
  VALIDE: 'bg-emerald-500 text-white',
  EN_ATTENTE: 'bg-amber-500 text-white',
  REFUSEE: 'bg-rose-500 text-white',
};

const statusLabels = {
  VALIDE: 'Validée',
  EN_ATTENTE: 'En attente',
  REFUSEE: 'Refusée',
};

export default function TableauDeBordPro() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette laverie ?')) {
      return;
    }

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
        // Actualiser les données
        setLoading(true);
        const fetchResponse = await fetch(`${API_BASE_URL}/api/professionnel/tableau-bord`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const result = await fetchResponse.json();
        setData(result);
        setLoading(false);
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Une erreur est survenue');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <main className="flex-1" />
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-red-600">{error || 'Erreur lors du chargement'}</div>
        </main>
        <Footer />
      </div>
    );
  }

  const { professionnel, stats, laveries } = data;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-md px-3 py-4 sm:max-w-2xl">
          {/* Section profil */}
          <section className="overflow-hidden rounded-[28px] bg-gradient-to-b from-cyan-500 to-cyan-600 text-white shadow-md">
            <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
              <button
                type="button"
                className="self-start text-sm font-medium opacity-90 transition hover:opacity-100"
              >
                Modifier le compte
              </button>

              <div className="relative">
                <img
                  src="https://via.placeholder.com/120"
                  alt={`${professionnel.prenom} ${professionnel.nom}`}
                  className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lg leading-none">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-xs opacity-90">0 commentaires</p>
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
          <section className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-slate-900 sm:text-xl">Vos laveries</h2>

            <div className="space-y-4">
              {laveries && laveries.map((laundry) => (
                <article
                  key={laundry.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative h-40 w-full bg-slate-200">
                    <img
                      src="https://images.unsplash.com/photo-1545173168-9f1947e6b5de?auto=format&fit=crop&w=900&q=80"
                      alt={laundry.nom}
                      className="h-full w-full object-cover"
                    />
                    <span
                      className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[laundry.statut]} shadow-md`}
                    >
                      {statusLabels[laundry.statut]}
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
                        className="flex-1 rounded-xl bg-cyan-500 px-3 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-cyan-600 sm:text-sm"
                      >
                        Modifier
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteLaverie(laundry.id)}
                        className="flex-1 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 sm:text-sm"
                      >
                        Supprimer
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

            <div className="mt-6 space-y-3">
              <Link
                to="/professionnel/laveries"
                className="block rounded-xl bg-cyan-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-cyan-600"
              >
                Voir toutes les laveries
              </Link>
              <Link
                to="/professionnel/laveries/ajouter"
                className="block rounded-xl border-2 border-cyan-500 px-4 py-3 text-center text-sm font-semibold text-cyan-600 transition hover:bg-cyan-50"
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
