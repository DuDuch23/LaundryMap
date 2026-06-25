import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import Uppy from '@uppy/core';
import API_BASE_URL from '../../services/api';
import { geocodeSuggestions, getMethodesPaiement, getServices } from '../../services/request';
import { EQUIPEMENTS_OPTIONS } from '../../constants/Laverie';
import type { HorairesJour, PlageHoraire } from '../../types/HorairesJour';
import type { Machine } from '../../types/Machine';
import type { WiLineCentrale } from '../../types/wiline/WiLineCentrale';
import type { GeoSuggestion, MethodePaiementOption, ServiceOption } from '../../types/Laverie';
import { LogoUpload } from '../../components/laverie/LogoUpload';
import { PhotosUpload } from '../../components/laverie/PhotosUpload';
import { CheckboxGroup } from '../../components/laverie/CheckboxGroup';
import { MachineRow } from '../../components/laverie/MachineRow';
import { Card } from '../../components/ui/Card';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { Field, inputClass } from '../../components/ui/Field';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';

const RESTRICTIONS_IMAGE = {
    maxFileSize: 5 * 1024 * 1024,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const defaultHoraires = (): Record<string, HorairesJour> =>
    Object.fromEntries(JOURS.map((j) => [j, { ouvert: true, plages: [{ ouverture: '07:00', fermeture: '22:00' }] }]));

const newMachine = (): Machine => ({
    id: crypto.randomUUID(),
    nom: '',
    type: 'lave-linge',
    capacite: '',
    tarif: '',
    duree: '',
    wiline_machine_id: null,
});

function buildHorairesFromApi(apiHoraires: Array<{ jour: string; debut: string; fin: string; ferme: boolean }>): Record<string, HorairesJour> {
    const result = defaultHoraires();
    const byDay: Record<string, Array<{ debut: string; fin: string; ferme: boolean }>> = {};
    for (const h of apiHoraires) {
        if (!byDay[h.jour]) byDay[h.jour] = [];
        byDay[h.jour].push(h);
    }
    for (const [jour, slots] of Object.entries(byDay)) {
        const isClosed = slots.every((s) => s.ferme);
        result[jour] = {
            ouvert: !isClosed,
            plages: isClosed
                ? [{ ouverture: '07:00', fermeture: '22:00' }]
                : slots.map((s) => ({ ouverture: s.debut, fermeture: s.fin })),
        };
    }
    return result;
}

export default function ModifierLaveriePro() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

    const [logoUppy, setLogoUppy] = useState<Uppy | null>(null);
    const [photosUppy, setPhotosUppy] = useState<Uppy | null>(null);

    useEffect(() => {
        const logo = new Uppy({
            id: 'logo-modifier',
            restrictions: { ...RESTRICTIONS_IMAGE, allowedFileTypes: [...RESTRICTIONS_IMAGE.allowedFileTypes], maxNumberOfFiles: 1 },
        });
        const photos = new Uppy({
            id: 'photos-modifier',
            restrictions: { ...RESTRICTIONS_IMAGE, allowedFileTypes: [...RESTRICTIONS_IMAGE.allowedFileTypes], maxNumberOfFiles: 15 },
        });
        setLogoUppy(logo);
        setPhotosUppy(photos);
        return () => { logo.destroy(); photos.destroy(); };
    }, []);

    const [servicesDisponibles,  setServicesDisponibles]  = useState<ServiceOption[]>([]);
    const [paiementsDisponibles, setPaiementsDisponibles] = useState<MethodePaiementOption[]>([]);
    const [loadingRef, setLoadingRef] = useState(true);

    const [wiLineConnecte,  setWiLineConnecte]  = useState(false);
    const [wiLineLoading,   setWiLineLoading]   = useState(false);
    const [wiLineError,     setWiLineError]     = useState<string | null>(null);

    const [existingLogo,            setExistingLogo]            = useState<{ id: number; image: string } | null>(null);
    const [existingGallery,         setExistingGallery]         = useState<Array<{ id: number; image: string; alt: string }>>([]);
    const [removedExistingImageIds, setRemovedExistingImageIds] = useState<number[]>([]);

    useEffect(() => {
        if (!logoUppy || !existingLogo) return;
        let cancelled = false;
        const pathname = new URL(existingLogo.image, window.location.origin).pathname;
        fetch(pathname)
            .then((r) => r.blob())
            .then((blob) => {
                if (cancelled) return;
                const alreadyAdded = logoUppy.getFiles().some((f: any) => f.meta?.existingServerId === existingLogo.id);
                if (!alreadyAdded) {
                    try { logoUppy.addFile({ name: 'logo-existant', type: blob.type || 'image/jpeg', data: blob, meta: { existingServerId: existingLogo.id } }); } catch {}
                }
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [logoUppy, existingLogo]);

    useEffect(() => {
        if (!logoUppy) return;
        const onRemoved = (file: any) => {
            if (file.meta?.existingServerId) setRemovedExistingImageIds((prev) => [...prev, file.meta.existingServerId]);
        };
        logoUppy.on('file-removed', onRemoved);
        return () => { logoUppy.off('file-removed', onRemoved); };
    }, [logoUppy]);

    useEffect(() => {
        if (!photosUppy || existingGallery.length === 0) return;
        existingGallery.forEach((img) => {
            const pathname = new URL(img.image, window.location.origin).pathname;
            fetch(pathname)
                .then((r) => r.blob())
                .then((blob) => {
                    const alreadyAdded = photosUppy.getFiles().some((f: any) => f.meta?.existingServerId === img.id);
                    if (!alreadyAdded) {
                        try { photosUppy.addFile({ name: img.alt || `photo-${img.id}`, type: blob.type || 'image/jpeg', data: blob, meta: { existingServerId: img.id } }); } catch {}
                    }
                })
                .catch(() => {});
        });
    }, [photosUppy, existingGallery]);

    useEffect(() => {
        if (!photosUppy) return;
        const onRemoved = (file: any) => {
            if (file.meta?.existingServerId) setRemovedExistingImageIds((prev) => [...prev, file.meta.existingServerId]);
        };
        photosUppy.on('file-removed', onRemoved);
        return () => { photosUppy.off('file-removed', onRemoved); };
    }, [photosUppy]);

    const [adresseQuery,           setAdresseQuery]           = useState('');
    const [adresseSuggestions,     setAdresseSuggestions]     = useState<GeoSuggestion[]>([]);
    const [showAdresseSuggestions, setShowAdresseSuggestions] = useState(false);
    const [adresseGeocoding,       setAdresseGeocoding]       = useState(false);
    const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const skipNextGeo  = useRef(false);

    const [bulkCount, setBulkCount] = useState(1);

    const [form, setForm] = useState({
        nomEtablissement: '',
        contactEmail: '',
        description: '',
        rue: '',
        codePostal: '',
        ville: '',
        pays: 'France',
        latitude: null as number | null,
        longitude: null as number | null,
        wiLineCode: '',
        wiLineCentraleId: null as number | null,
        horaires: defaultHoraires(),
        machines: [] as Machine[],
        equipements: [] as string[],
        serviceIds: [] as number[],
        paiementIds: [] as number[],
    });

    useEffect(() => {
        Promise.all([getServices(), getMethodesPaiement()])
            .then(([s, p]) => { setServicesDisponibles(s); setPaiementsDisponibles(p); })
            .catch(() => {})
            .finally(() => setLoadingRef(false));
    }, []);

    useEffect(() => {
        if (!id) return;
        const token = localStorage.getItem('token');
        fetch(`${API_BASE_URL}/api/professionnel/laveries/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                setForm({
                    nomEtablissement: data.nom || '',
                    contactEmail: data.email || '',
                    description: data.description || '',
                    rue: data.rue || data.adresse || '',
                    codePostal: data.codePostal ? String(data.codePostal) : '',
                    ville: data.ville || '',
                    pays: data.pays || 'France',
                    latitude: data.latitude ?? null,
                    longitude: data.longitude ?? null,
                    wiLineCode: '',
                    wiLineCentraleId: null,
                    horaires: Array.isArray(data.horaires) && data.horaires.length > 0
                        ? buildHorairesFromApi(data.horaires)
                        : defaultHoraires(),
                    machines: Array.isArray(data.equipements)
                        ? data.equipements.map((e: any) => ({
                            id: crypto.randomUUID(),
                            nom: e.nom || '',
                            type: e.type || 'lave-linge',
                            capacite: String(e.capacite ?? ''),
                            tarif: String(e.tarif ?? ''),
                            duree: String(e.duree ?? ''),
                            wiline_machine_id: e.equipementReference ?? null,
                        }))
                        : [],
                    equipements: Array.isArray(data.amenites) ? data.amenites : [],
                    serviceIds: Array.isArray(data.services) ? data.services.map((s: any) => s.id) : [],
                    paiementIds: Array.isArray(data.paiements) ? data.paiements.map((p: any) => p.id) : [],
                });
                setAdresseQuery(data.rue || data.adresse || '');
                if (data.logo) setExistingLogo(data.logo);
                setExistingGallery(Array.isArray(data.images) ? data.images : []);
            })
            .catch(() => setSubmitError('Impossible de charger la laverie.'))
            .finally(() => setIsLoading(false));
    }, [id]);

    useEffect(() => {
        if (skipNextGeo.current) { skipNextGeo.current = false; return; }
        const { rue, codePostal, ville, pays } = form;
        if (!rue.trim() || !codePostal.trim() || !ville.trim()) return;
        const timer = setTimeout(async () => {
            try {
                const params = new URLSearchParams({
                    format: 'json', limit: '1',
                    street: rue.trim(), postalcode: codePostal.trim(),
                    city: ville.trim(), country: pays.trim() || 'France',
                });
                const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { 'Accept-Language': 'fr' } });
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setForm((f) => ({ ...f, latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) }));
                }
            } catch {}
        }, 800);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.rue, form.codePostal, form.ville, form.pays]);

    const set = (key: keyof typeof form, value: any) => {
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((e) => ({ ...e, [key]: undefined }));
    };

    const handleAdresseInput = (v: string) => {
        setAdresseQuery(v);
        if (suggestTimer.current) clearTimeout(suggestTimer.current);
        if (v.trim().length < 2) { setAdresseSuggestions([]); setShowAdresseSuggestions(false); return; }
        suggestTimer.current = setTimeout(async () => {
            setAdresseGeocoding(true);
            const results = await geocodeSuggestions(v);
            setAdresseSuggestions(results);
            setShowAdresseSuggestions(results.length > 0);
            setAdresseGeocoding(false);
        }, 350);
    };

    const selectionnerAdresse = (s: GeoSuggestion) => {
        skipNextGeo.current = true;
        setAdresseQuery(s.label);
        setShowAdresseSuggestions(false);
        setForm((f) => ({
            ...f,
            rue:        s.rue        ?? '',
            codePostal: s.codePostal ?? '',
            ville:      s.ville      ?? '',
            pays:       s.pays       ?? 'France',
            latitude:   s.latitude,
            longitude:  s.longitude,
        }));
        setErrors((e) => ({ ...e, rue: undefined, codePostal: undefined, ville: undefined, pays: undefined }));
    };

    const toggleEquipement = (val: string) =>
        setForm((f) => ({
            ...f,
            equipements: f.equipements.includes(val) ? f.equipements.filter((v) => v !== val) : [...f.equipements, val],
        }));

    const toggleServiceId = (sid: number) =>
        setForm((f) => ({
            ...f,
            serviceIds: f.serviceIds.includes(sid) ? f.serviceIds.filter((v) => v !== sid) : [...f.serviceIds, sid],
        }));

    const togglePaiementId = (pid: number) =>
        setForm((f) => ({
            ...f,
            paiementIds: f.paiementIds.includes(pid) ? f.paiementIds.filter((v) => v !== pid) : [...f.paiementIds, pid],
        }));

    const setHoraire = (jour: string, ouvert: boolean) =>
        setForm((f) => ({ ...f, horaires: { ...f.horaires, [jour]: { ...f.horaires[jour], ouvert } } }));

    const setHorairePlage = (jour: string, idx: number, field: keyof PlageHoraire, value: string) =>
        setForm((f) => {
            const plages = f.horaires[jour].plages.map((p, i) => i === idx ? { ...p, [field]: value } : p);
            return { ...f, horaires: { ...f.horaires, [jour]: { ...f.horaires[jour], plages } } };
        });

    const addPlage = (jour: string) =>
        setForm((f) => ({
            ...f,
            horaires: { ...f.horaires, [jour]: { ...f.horaires[jour], plages: [...f.horaires[jour].plages, { ouverture: '07:00', fermeture: '22:00' }] } },
        }));

    const removePlage = (jour: string, idx: number) =>
        setForm((f) => ({
            ...f,
            horaires: { ...f.horaires, [jour]: { ...f.horaires[jour], plages: f.horaires[jour].plages.filter((_, i) => i !== idx) } },
        }));

    const addMachines = (n: number) => set('machines', [...form.machines, ...Array.from({ length: n }, () => newMachine())]);

    const updateMachine = (mid: string, field: keyof Machine, value: string) =>
        setForm((f) => ({ ...f, machines: f.machines.map((m) => m.id === mid ? { ...m, [field]: value } : m) }));

    const removeMachine = (mid: string) =>
        setForm((f) => ({ ...f, machines: f.machines.filter((m) => m.id !== mid) }));

    const selectionnerCentrale = (centrale: WiLineCentrale) => {
        const machinesImportees: Machine[] = centrale.machines
            .filter((m) => !m.hors_service)
            .map((m) => ({
                id: crypto.randomUUID(),
                nom: m.nom,
                type: m.type,
                capacite: String(m.capacite),
                tarif: String(m.tarif),
                duree: String(m.duree),
                wiline_machine_id: m.wiline_machine_id,
            }));

        const matchedPaiementIds = paiementsDisponibles
            .filter((p) => {
                const nom = p.nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
                if (centrale.paiements.coin     && (nom.includes('piece') || nom.includes('monnaie'))) return true;
                if (centrale.paiements.bill     && nom.includes('billet')) return true;
                if (centrale.paiements.card     && (nom.includes('bancaire') || nom.startsWith('cb') || nom.includes(' cb') || nom.includes('visa') || nom.includes('master'))) return true;
                if (centrale.paiements.fidelity && (nom.includes('fidelite') || nom.includes('fidelity'))) return true;
                return false;
            })
            .map((p) => p.id);

        if (centrale.adresse) {
            setAdresseQuery(`${centrale.adresse}, ${centrale.codePostal} ${centrale.ville}`.trim());
        }

        setForm((f) => ({
            ...f,
            wiLineCentraleId: centrale.id,
            nomEtablissement: centrale.nom         || f.nomEtablissement,
            description:      centrale.description || f.description,
            rue:              centrale.adresse      || f.rue,
            codePostal:       centrale.codePostal   || f.codePostal,
            ville:            centrale.ville         || f.ville,
            pays:             centrale.pays          || f.pays,
            horaires:         centrale.horaires ?? f.horaires,
            machines:         machinesImportees,
            paiementIds:      matchedPaiementIds.length > 0 ? matchedPaiementIds : f.paiementIds,
        }));
        setErrors((e) => ({ ...e, nomEtablissement: undefined, rue: undefined, codePostal: undefined, ville: undefined, pays: undefined }));
    };

    const handleWiLineConnexion = async () => {
        const serial = form.wiLineCode.trim().toUpperCase();
        if (!serial) return;
        setWiLineLoading(true);
        setWiLineError(null);
        setWiLineConnecte(false);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/professionnel/wiline/centrale/${serial}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) { setWiLineError(data?.message ?? 'Erreur lors de la récupération de la centrale.'); return; }
            setWiLineConnecte(true);
            selectionnerCentrale(data as WiLineCentrale);
        } catch {
            setWiLineError('Impossible de joindre le service Wi-Line. Vérifiez votre connexion.');
        } finally {
            setWiLineLoading(false);
        }
    };

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!form.nomEtablissement.trim()) e.nomEtablissement = 'Le nom est obligatoire.';
        if (!form.rue.trim())             e.rue              = 'La rue est obligatoire.';
        if (!form.codePostal.trim())      e.codePostal       = 'Le code postal est obligatoire.';
        if (!form.ville.trim())           e.ville            = 'La ville est obligatoire.';
        if (!form.pays.trim())            e.pays             = 'Le pays est obligatoire.';
        if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
            e.contactEmail = 'Email invalide.';
        }
        if (!Object.values(form.horaires).some((h) => h.ouvert && h.plages.length > 0)) {
            e.horaires = 'Au moins un jour doit être ouvert.';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const token = localStorage.getItem('token');
            const fd = new FormData();
            fd.append('nomEtablissement', form.nomEtablissement);
            fd.append('contactEmail',     form.contactEmail);
            fd.append('description',      form.description);
            fd.append('rue',              form.rue);
            fd.append('codePostal',       form.codePostal);
            fd.append('ville',            form.ville);
            fd.append('pays',             form.pays);
            if (form.latitude  !== null) fd.append('latitude',  String(form.latitude));
            if (form.longitude !== null) fd.append('longitude', String(form.longitude));
            if (form.wiLineCentraleId !== null) fd.append('wiLineCentraleId', String(form.wiLineCentraleId));

            fd.append('horaires',       JSON.stringify(form.horaires));
            fd.append('machines',       JSON.stringify(form.machines));
            fd.append('equipements',    JSON.stringify(form.equipements));
            fd.append('serviceIds',     JSON.stringify(form.serviceIds));
            fd.append('paiementIds',    JSON.stringify(form.paiementIds));
            fd.append('removeImageIds', JSON.stringify(removedExistingImageIds));

            if (logoUppy) {
                const logoFile = logoUppy.getFiles().find((f) => !f.meta?.existingServerId);
                if (logoFile) fd.append('logo', logoFile.data as File);
            }
            photosUppy?.getFiles()
                .filter((f) => !f.meta?.existingServerId)
                .forEach((f) => fd.append('images[]', f.data as File));

            const res = await fetch(`${API_BASE_URL}/api/professionnel/laveries/${id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });

            if (res.status === 413) {
                throw new Error('Le fichier est trop volumineux. Réduisez la taille de vos images (5 Mo maximum par image).');
            }
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.erreur ?? data?.message ?? 'La mise à jour a échoué.');
            navigate('/professionnel/tableau-de-bord');
        } catch (err: any) {
            setSubmitError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="w-full max-w-[1280px] bg-gray-50 pt-20 pb-16" />;
    }

    return (
        <div className="w-full max-w-[1280px] bg-gray-50 pt-20 pb-16">
            <div className="mx-auto px-4">

                <div className="mb-8">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate('/professionnel/tableau-de-bord')}
                        className="mb-4 text-gray-500 hover:text-[#14A8DE] -ml-2"
                    >
                        <ArrowLeft className="size-4" />
                        Revenir en arrière
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Modifier ma laverie</h1>
                    <p className="text-gray-500 mt-1">Les modifications seront enregistrées immédiatement.</p>
                </div>

                <form encType="multipart/form-data" onSubmit={handleSubmit} noValidate>
                <div className="space-y-6">

                    {/* ── 1. WI-LINE ── */}
                    <Card>
                        <SectionTitle step={1} title="Centrale WI-LINE" subtitle="Optionnel — pré-remplit automatiquement le formulaire depuis votre centrale" />
                        <div className="flex gap-3 mt-4 mb-2 flex-wrap">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Numéro de série Wi-Line
                                </label>
                                <input
                                    type="text"
                                    value={form.wiLineCode}
                                    onChange={(e) => set('wiLineCode', e.target.value.toUpperCase())}
                                    placeholder="Ex : 17415410EC125A03"
                                    className={inputClass()}
                                    maxLength={16}
                                    autoCorrect="off"
                                    autoCapitalize="characters"
                                    spellCheck={false}
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={handleWiLineConnexion}
                                disabled={wiLineLoading || !form.wiLineCode.trim()}
                                className="bg-[#14A8DE] text-white border-0 shrink-0 self-end mb-0.5"
                            >
                                {wiLineLoading ? 'Connexion…' : 'Connecter'}
                            </Button>
                        </div>
                        {wiLineError && (
                            <p className="text-xs text-red-500 mt-1 mb-2">{wiLineError}</p>
                        )}
                        {wiLineConnecte && (
                            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                <CheckCircle2 className="size-3.5" />
                                Informations, horaires et {form.machines.length} machine(s) importés — vérifiez les sections ci-dessous.
                            </p>
                        )}
                    </Card>

                    {/* ── 2. Machines ── */}
                    <Card>
                        <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
                            <SectionTitle step={2} title="Machines" subtitle="Ajoutez vos machines manuellement ou via WI-LINE" />
                            <div className="flex items-center gap-2 shrink-0">
                                <input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={bulkCount}
                                    onChange={(e) => setBulkCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                                    className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-center focus:border-[#14A8DE] focus:outline-none"
                                    aria-label="Nombre de machines à ajouter"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addMachines(bulkCount)}
                                    className="border-[#14A8DE] text-[#14A8DE] hover:bg-[#14A8DE]/5 hover:text-[#14A8DE]"
                                >
                                    <Plus className="size-3.5" />
                                    Ajouter {bulkCount > 1 ? bulkCount : ''}
                                </Button>
                            </div>
                        </div>
                        {form.machines.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                                <p className="text-sm text-gray-400">Aucune machine ajoutée</p>
                                <p className="text-xs text-gray-300 mt-1">Connectez une centrale WI-LINE ou ajoutez manuellement</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {form.machines.map((machine, idx) => (
                                    <MachineRow
                                        key={machine.id}
                                        machine={machine}
                                        index={idx}
                                        onUpdate={updateMachine}
                                        onRemove={removeMachine}
                                    />
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* ── 3. Informations générales ── */}
                    <Card>
                        <SectionTitle step={3} title="Informations générales" />
                        <div className="grid grid-cols-1 gap-4">
                            <Field label="Nom de l'établissement" required error={errors.nomEtablissement}>
                                <input type="text" value={form.nomEtablissement} onChange={(e) => set('nomEtablissement', e.target.value)} placeholder="Ex : Laverie du Centre" className={inputClass(errors.nomEtablissement)} />
                            </Field>
                            <Field label="Email de contact" error={errors.contactEmail}>
                                <input type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} placeholder="contact@malaverie.fr" className={inputClass(errors.contactEmail)} />
                            </Field>
                            <Field label="Description">
                                <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} placeholder="Décrivez votre établissement..." className={inputClass() + ' resize-none'} />
                            </Field>
                        </div>
                    </Card>

                    {/* ── 4. Adresse ── */}
                    <Card>
                        <SectionTitle step={4} title="Adresse" subtitle="Champs obligatoires" />
                        <div className="grid grid-cols-1 gap-4">
                            <div className="relative">
                                <label className="block text-md font-medium text-gray-700 mb-1.5">
                                    Rechercher une adresse
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                                    </span>
                                    <input
                                        type="text"
                                        value={adresseQuery}
                                        onChange={(e) => handleAdresseInput(e.target.value)}
                                        onBlur={() => setTimeout(() => setShowAdresseSuggestions(false), 200)}
                                        placeholder="Ex : 12 rue des Fleurs, Mulhouse…"
                                        autoComplete="off"
                                        className="max-w-[stretch] w-full pl-8 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#14A8DE] focus:bg-white focus:ring-2 focus:ring-[#14A8DE]/20 outline-none transition-all"
                                    />
                                    {adresseGeocoding && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="w-3.5 h-3.5 border-2 border-[#14A8DE] border-t-transparent rounded-full animate-spin" />
                                        </span>
                                    )}
                                </div>
                                {showAdresseSuggestions && adresseSuggestions.length > 0 && (
                                    <ul className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                        {adresseSuggestions.map((s, i) => {
                                            const [principal, ...reste] = s.label.split(',');
                                            return (
                                                <li key={i}>
                                                    <button
                                                        type="button"
                                                        onMouseDown={() => selectionnerAdresse(s)}
                                                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                                    >
                                                        <span className="font-medium text-gray-800">{principal}</span>
                                                        {reste.length > 0 && (
                                                            <span className="text-gray-400 text-xs ml-2">{reste.join(',').trim()}</span>
                                                        )}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                            <Field label="Rue" required error={errors.rue}>
                                <input type="text" value={form.rue} onChange={(e) => set('rue', e.target.value)} placeholder="12 rue des Fleurs" className={inputClass(errors.rue)} />
                            </Field>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Code postal" required error={errors.codePostal}>
                                    <input type="text" value={form.codePostal} onChange={(e) => set('codePostal', e.target.value)} placeholder="68100" className={inputClass(errors.codePostal)} />
                                </Field>
                                <Field label="Ville" required error={errors.ville}>
                                    <input type="text" value={form.ville} onChange={(e) => set('ville', e.target.value)} placeholder="Mulhouse" className={inputClass(errors.ville)} />
                                </Field>
                            </div>
                            <Field label="Pays" required error={errors.pays}>
                                <input type="text" value={form.pays} onChange={(e) => set('pays', e.target.value)} placeholder="France" className={inputClass(errors.pays)} />
                            </Field>
                        </div>
                    </Card>

                    {/* ── 5. Horaires ── */}
                    <Card>
                        <SectionTitle step={5} title="Horaires d'ouverture" subtitle="Au moins un jour obligatoire" />
                        {errors.horaires && <p className="text-xs text-red-500 mb-3">{errors.horaires}</p>}
                        <div className="divide-y divide-gray-100">
                            {JOURS.map((jour) => {
                                const h = form.horaires[jour];
                                return (
                                    <div key={jour} className="flex items-center gap-3 flex-wrap justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 text-md font-medium text-gray-700 shrink-0">{jour}</div>
                                            <ToggleSwitch
                                                checked={h.ouvert}
                                                onChange={(val) => setHoraire(jour, val)}
                                                label={`${jour} ouvert`}
                                            />
                                            <span className="text-xs text-gray-500">{h.ouvert ? 'Ouvert' : 'Fermé'}</span>
                                        </div>
                                        {h.ouvert && (
                                            <div className="pl-0 sm:pl-28 space-y-2">
                                                {h.plages.map((plage, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <input
                                                            type="time"
                                                            value={plage.ouverture}
                                                            onChange={(e) => setHorairePlage(jour, idx, 'ouverture', e.target.value)}
                                                            className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:border-[#14A8DE] focus:outline-none"
                                                        />
                                                        <span className="text-gray-400 text-sm shrink-0">→</span>
                                                        <input
                                                            type="time"
                                                            value={plage.fermeture}
                                                            onChange={(e) => setHorairePlage(jour, idx, 'fermeture', e.target.value)}
                                                            className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:border-[#14A8DE] focus:outline-none"
                                                        />
                                                        {h.plages.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removePlage(jour, idx)}
                                                                className="shrink-0 text-rose-400 hover:text-rose-600 text-lg leading-none transition-colors cursor-pointer"
                                                                aria-label="Supprimer cette plage"
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addPlage(jour)}
                                                    className="text-xs text-[#14A8DE] hover:text-[#119ac8] flex items-center gap-1 transition-colors cursor-pointer"
                                                >
                                                    <Plus className="size-3" /> Ajouter une plage horaire
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* ── 6. Équipements, services & paiements ── */}
                    <Card>
                        <SectionTitle step={6} title="Équipements & services" />
                        <div className="space-y-6">
                            <CheckboxGroup
                                title="Équipements"
                                items={EQUIPEMENTS_OPTIONS.map((e) => ({ id: e, label: e }))}
                                isChecked={(eid) => form.equipements.includes(eid as string)}
                                onToggle={(eid) => toggleEquipement(eid as string)}
                            />
                            <CheckboxGroup
                                title="Services proposés"
                                items={servicesDisponibles.map((s) => ({ id: s.id, label: s.nom }))}
                                isChecked={(eid) => form.serviceIds.includes(eid as number)}
                                onToggle={(eid) => toggleServiceId(eid as number)}
                                loading={loadingRef}
                                emptyMessage="Aucun service disponible."
                            />
                            <CheckboxGroup
                                title="Moyens de paiement"
                                items={paiementsDisponibles.map((p) => ({ id: p.id, label: p.nom }))}
                                isChecked={(eid) => form.paiementIds.includes(eid as number)}
                                onToggle={(eid) => togglePaiementId(eid as number)}
                                loading={loadingRef}
                                emptyMessage="Aucun moyen de paiement disponible."
                            />
                        </div>
                    </Card>

                    {/* ── 7. Logo & photos ── */}
                    <Card>
                        <SectionTitle step={7} title="Logo & photos" subtitle="JPEG, PNG ou WebP — 5 Mo max par fichier" />
                        <div className="mb-6">
                            <p className="text-md font-medium text-gray-700 mb-3">Logo de l'établissement</p>
                            {logoUppy && <LogoUpload uppy={logoUppy} />}
                        </div>
                        <div className="border-t border-gray-100 mb-5" />
                        <div>
                            <p className="text-md font-medium text-gray-700 mb-3">Photos de la laverie</p>
                            {photosUppy && <PhotosUpload uppy={photosUppy} />}
                        </div>
                    </Card>

                    {submitError && (
                        <Alert variant="destructive" className="border-red-200 bg-red-50">
                            <AlertCircle className="size-4 text-red-600" />
                            <AlertDescription className="text-red-700">{submitError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/professionnel/tableau-de-bord')}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#14A8DE] hover:bg-[#119ac8] text-white border-0"
                        >
                            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </Button>
                    </div>

                </div>
                </form>
            </div>
        </div>
    );
}
