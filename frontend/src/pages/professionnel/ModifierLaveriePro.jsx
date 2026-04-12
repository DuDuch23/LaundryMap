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
    isWiLine: false,
    wiLineReference: '',
    horaires: defaultHoraires,
    equipements: [],
  });

  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);
  const [removedExistingImageIds, setRemovedExistingImageIds] = useState([]);

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
          isWiLine: Boolean(data.wiLineReference),
          wiLineReference: data.wiLineReference ? String(data.wiLineReference) : '',
          horaires: Array.isArray(data.horaires) && data.horaires.length > 0
            ? data.horaires.map((horaire) => ({
                jour: horaire.jour,
                debut: horaire.debut || '10:00',
                fin: horaire.fin || '22:00',
                ferme: Boolean(horaire.ferme),
              }))
            : defaultHoraires,
          equipements: Array.isArray(data.equipements)
            ? data.equipements.map((equipement) => ({
                equipementReference: equipement.equipementReference ?? null,
                nom: equipement.nom || '',
                type: equipement.type || '',
                capacite: equipement.capacite ? String(equipement.capacite) : '',
                tarif: equipement.tarif !== undefined && equipement.tarif !== null ? String(equipement.tarif) : '',
                duree: equipement.duree ? String(equipement.duree) : '',
              }))
            : [],
        });

        setExistingGallery(Array.isArray(data.images) ? data.images : []);
        setRemovedExistingImageIds([]);
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

  const wiLineReferenceMissing = form.isWiLine && form.wiLineReference.trim() === '';

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

  const addEquipement = () => {
    setForm((prev) => ({
      ...prev,
      equipements: [
        ...prev.equipements,
        {
          equipementReference: null,
          nom: '',
          type: '',
          capacite: '',
          tarif: '',
          duree: '',
        },
      ],
    }));
  };

  const updateEquipement = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      equipements: prev.equipements.map((equipement, equipementIndex) => (
        equipementIndex === index ? { ...equipement, [field]: value } : equipement
      )),
    }));
  };

  const removeEquipement = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      equipements: prev.equipements.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleGalleryChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    setGalleryFiles((prev) => {
      const merged = [...prev, ...files];
      const seen = new Set();

      return merged.filter((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    });

    event.target.value = '';
  };

  useEffect(() => {
    const previews = galleryFiles.map((file) => URL.createObjectURL(file));
    setGalleryPreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [galleryFiles]);

  const handleRemovePendingImage = (indexToRemove) => {
    setGalleryFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setGalleryPreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleRemoveExistingImage = (imageId) => {
    setExistingGallery((prev) => prev.filter((image) => image.id !== imageId));
    setRemovedExistingImageIds((prev) => (prev.includes(imageId) ? prev : [...prev, imageId]));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotification(null);
    setError(null);

    if (wiLineReferenceMissing) {
      setSaving(false);
      setError('La référence API WI-LINE est obligatoire si la laverie est connectée.');
      return;
    }

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
      payload.append('wiLineReference', form.isWiLine ? form.wiLineReference : '');
      payload.append('horaires', JSON.stringify(joursTries));
      payload.append('equipements', JSON.stringify(form.equipements.map((equipement) => ({
        equipementReference: equipement.equipementReference,
        nom: (equipement.nom || '').trim(),
        type: (equipement.type || '').trim(),
        capacite: Number.parseInt(equipement.capacite, 10) || 0,
        tarif: Number.parseFloat(equipement.tarif) || 0,
        duree: Number.parseInt(equipement.duree, 10) || 0,
      }))));
      payload.append('removeImageIds', JSON.stringify(removedExistingImageIds));

      galleryFiles.forEach((file) => {
        payload.append('images[]', file);
      });

      const response = await fetch(`${API_BASE_URL}/api/professionnel/laveries/${id}`, {
        method: 'POST',
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

          <form onSubmit={handleSubmit} className="!box-border space-y-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-800">Laverie connectée à WI-LINE ?</p>
              <div className="flex gap-4 text-sm text-slate-700">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="isWiLine"
                    checked={form.isWiLine === true}
                    onChange={() => updateField('isWiLine', true)}
                  />
                  Oui
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="isWiLine"
                    checked={form.isWiLine === false}
                    onChange={() => {
                      updateField('isWiLine', false);
                      updateField('wiLineReference', '');
                    }}
                  />
                  Non
                </label>
              </div>

              {form.isWiLine && (
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-800">Référence API WI-LINE</label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    value={form.wiLineReference}
                    onChange={(e) => updateField('wiLineReference', e.target.value.replace(/\D/g, ''))}
                    placeholder="Ex: 123456"
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                      wiLineReferenceMissing
                        ? 'border-rose-400 focus:border-rose-500'
                        : 'border-slate-300 focus:border-cyan-500'
                    }`}
                  />
                  <p className="text-xs text-slate-500">Renseigne l'identifiant technique fourni par l’API WI-LINE.</p>
                  {wiLineReferenceMissing && (
                    <p className="text-xs font-medium text-rose-600">Champ requis lorsque WI-LINE est activé.</p>
                  )}
                </div>
              )}
            </div>

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
              <div className="min-w-0 space-y-1">
                <label className="text-sm font-semibold text-slate-800">Code postal</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={form.codePostal}
                  onChange={(e) => updateField('codePostal', e.target.value.replace(/\D/g, ''))}
                  className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="min-w-0 space-y-1">
                <label className="text-sm font-semibold text-slate-800">Ville</label>
                <input
                  type="text"
                  required
                  value={form.ville}
                  onChange={(e) => updateField('ville', e.target.value)}
                  className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
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
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Équipements</p>
                <button
                  type="button"
                  onClick={addEquipement}
                  className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-100"
                >
                  + Ajouter
                </button>
              </div>

              {form.equipements.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-3 text-xs text-slate-500">
                  Aucun équipement configuré.
                </div>
              ) : (
                <div className="space-y-3">
                  {form.equipements.map((equipement, index) => (
                    <div key={`equipement-${index}`} className="space-y-2 rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-700">Équipement {index + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeEquipement(index)}
                          className="rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                        >
                          Supprimer
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={equipement.nom}
                          onChange={(e) => updateEquipement(index, 'nom', e.target.value)}
                          placeholder="Nom (ex: Lave-linge 8 kg)"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={equipement.type}
                          onChange={(e) => updateEquipement(index, 'type', e.target.value)}
                          placeholder="Type (Lave-linge...)"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-none"
                        />
                        <input
                          type="number"
                          min="1"
                          value={equipement.capacite}
                          onChange={(e) => updateEquipement(index, 'capacite', e.target.value.replace(/\D/g, ''))}
                          placeholder="Capacité (kg)"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-none"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={equipement.tarif}
                          onChange={(e) => updateEquipement(index, 'tarif', e.target.value)}
                          placeholder="Tarif (€)"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-none"
                        />
                        <input
                          type="number"
                          min="1"
                          value={equipement.duree}
                          onChange={(e) => updateEquipement(index, 'duree', e.target.value.replace(/\D/g, ''))}
                          placeholder="Durée (min)"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Galerie d&apos;images</label>
              <div className="rounded-xl border border-dashed border-slate-300 p-3">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.gif,image/*"
                  multiple
                  onChange={handleGalleryChange}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-cyan-700 hover:file:bg-cyan-100"
                />
                <p className="mt-2 text-xs text-slate-500">Formats supportés: PNG, JPG, JPEG, WEBP, GIF. Taille max 5 Mo par image.</p>

                {existingGallery.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-semibold text-slate-700">Images actuelles</p>
                    <div className="grid grid-cols-3 gap-2">
                      {existingGallery.map((image) => (
                        <div key={image.id || image.image} className="relative">
                          <img
                            src={image.image}
                            alt={image.alt || 'Image laverie'}
                            className="h-20 w-full rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(image.id)}
                            className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-lg font-bold leading-none text-white"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {galleryPreviews.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-semibold text-slate-700">Nouvelles images à ajouter</p>
                    <div className="grid grid-cols-3 gap-2">
                      {galleryPreviews.map((preview, index) => (
                        <div key={`${preview}-${index}`} className="relative">
                          <img
                            src={preview}
                            alt="Nouvelle image"
                            className="h-20 w-full rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePendingImage(index)}
                            className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-lg font-bold leading-none text-white"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-800">Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Décris votre laverie (services, ambiance, accès, points forts...)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

            <button
              type="submit"
              disabled={saving || wiLineReferenceMissing}
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
