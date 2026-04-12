import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import API_BASE_URL from '../../services/api';

const joursOrdre = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const defaultHoraires = joursOrdre.map((jour) => ({
  jour,
  debut: '10:00',
  fin: '22:00',
  ferme: jour === 'Dimanche',
}));

export default function ModifierLaveriePro() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const [form, setForm] = useState({
    nom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: 'France',
    email: '',
    description: '',
    statutOuverture: 'online',
    horaires: defaultHoraires,
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    const fetchLaverie = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vous devez être connecté.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/professionnel/laveries/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Impossible de charger la laverie.');
        }

        const data = await response.json();

        setForm({
          nom: data.nom || '',
          adresse: data.adresse || '',
          codePostal: data.codePostal ? String(data.codePostal) : '',
          ville: data.ville || '',
          pays: data.pays || 'France',
          email: data.email || '',
          description: data.description || '',
          statutOuverture: 'online',
          horaires: Array.isArray(data.horaires) && data.horaires.length > 0
            ? data.horaires.map((horaire) => ({
                jour: horaire.jour,
                debut: horaire.debut || '10:00',
                fin: horaire.fin || '22:00',
                ferme: Boolean(horaire.ferme),
              }))
            : defaultHoraires,
        });

        setLogoPreview(data.image || null);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
    };

    fetchLaverie();
  }, [id]);

  const joursTries = useMemo(() => {
    const byJour = new Map(form.horaires.map((h) => [h.jour, h]));
    return joursOrdre.map((jour) => byJour.get(jour) || { jour, debut: '10:00', fin: '22:00', ferme: false });
  }, [form.horaires]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateHoraire = (jour, field, value) => {
    setForm((prev) => ({
      ...prev,
      horaires: prev.horaires.map((horaire) =>
        horaire.jour === jour ? { ...horaire, [field]: value } : horaire,
      ),
    }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotification(null);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vous devez être connecté.');
      }

      const payload = new FormData();
      payload.append('nom', form.nom);
      payload.append('adresse', form.adresse);
      payload.append('codePostal', form.codePostal);
      payload.append('ville', form.ville);
      payload.append('pays', form.pays || 'France');
      payload.append('email', form.email);
      payload.append('description', form.description);
      payload.append('horaires', JSON.stringify(joursTries));

      if (logoFile) {
        payload.append('logo', logoFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/professionnel/laveries/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.erreur || 'La mise à jour a échoué.');
      }

      setNotification({ type: 'success', message: 'Laverie modifiée avec succès.' });
      setTimeout(() => {
        navigate('/professionnel/tableau-de-bord');
      }, 1000);
    } catch (err) {
      console.error(err);
      const message = err.message || 'Une erreur est survenue.';
      setError(message);
      setNotification({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen flex-col bg-slate-50 pt-24" />;
  }

  return (
    <div className="flex w-full flex-col bg-slate-50 pt-24">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-lg ${
            notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        >
          {notification.message}
        </div>
      )}

      <main className="flex-1">
        <div className="mx-auto w-full max-w-md px-2 pb-8">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-900">Modifier ma laverie</h1>
            <Link
              to="/professionnel/tableau-de-bord"
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              Retour
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-800">Nom d&apos;établissement</label>
              <input
                type="text"
                required
                value={form.nom}
                onChange={(e) => updateField('nom', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-800">Adresse</label>
              <input
                type="text"
                required
                value={form.adresse}
                onChange={(e) => updateField('adresse', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-800">Code postal</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={form.codePostal}
                  onChange={(e) => updateField('codePostal', e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-800">Ville</label>
                <input
                  type="text"
                  required
                  value={form.ville}
                  onChange={(e) => updateField('ville', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-800">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-800">Statut online/outline</p>
              <div className="flex gap-4 text-sm text-slate-700">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="statutOuverture"
                    checked={form.statutOuverture === 'online'}
                    onChange={() => updateField('statutOuverture', 'online')}
                  />
                  Oui
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="statutOuverture"
                    checked={form.statutOuverture === 'outline'}
                    onChange={() => updateField('statutOuverture', 'outline')}
                  />
                  Non
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-800">Horaires</p>
              <div className="space-y-2 rounded-xl border border-slate-200 p-3">
                {joursTries.map((horaire) => (
                  <div key={horaire.jour} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-700">{horaire.jour}</span>
                    <input
                      type="time"
                      value={horaire.debut}
                      disabled={horaire.ferme}
                      onChange={(e) => updateHoraire(horaire.jour, 'debut', e.target.value)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 disabled:bg-slate-100"
                    />
                    <input
                      type="time"
                      value={horaire.fin}
                      disabled={horaire.ferme}
                      onChange={(e) => updateHoraire(horaire.jour, 'fin', e.target.value)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 disabled:bg-slate-100"
                    />
                    <label className="inline-flex items-center gap-1 text-slate-600">
                      <input
                        type="checkbox"
                        checked={horaire.ferme}
                        onChange={(e) => updateHoraire(horaire.jour, 'ferme', e.target.checked)}
                      />
                      Fermé
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Logo</label>
              <div className="rounded-xl border border-dashed border-slate-300 p-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-cyan-700 hover:file:bg-cyan-100"
                />
                <p className="mt-2 text-xs text-slate-500">Formats image acceptés, taille max 5 Mo.</p>
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Aperçu du logo"
                    className="mt-3 h-28 w-full rounded-lg object-cover"
                  />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-800">Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Enregistrement...' : 'Modifier la laverie'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
