import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import API_BASE_URL from '../../services/api';
import { getMethodesPaiement, getServices } from '../../services/request';
import { EQUIPEMENTS_OPTIONS } from '../../constants/Laverie';
import { FormDataAddLaverie } from '../../types/FormDataAddLaverie';
import { HorairesJour } from '../../types/HorairesJour';
import { Machine } from '../../types/Machine';
import { WiLineCentrale } from '../../types/wiline/WiLineCentrale';
import type { MethodePaiementOption, ServiceOption } from '../../types/Laverie';

interface PhotoLocale {
    id: string;
    preview: string;
    file: File;
}

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const defaultHoraires = (): Record<string, HorairesJour> =>
    Object.fromEntries(JOURS.map((j) => [j, { ouvert: true, ouverture: '07:00', fermeture: '22:00' }]));

const newMachine = (): Machine => ({
    id: crypto.randomUUID(),
    nom: '',
    type: 'lave-linge',
    capacite: '',
    tarif: '',
    duree: '',
    wiline_machine_id: null,
});

// ─── Sous-composants ──────────────────────────────────────────────────────────

function SectionTitle({ step, title, subtitle }: { step: number; title: string; subtitle?: string }) {
    return (
        <div className="flex items-start gap-4 mb-6 flex-wrap">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#14A8DE] text-white flex items-center justify-center text-sm font-bold">{step}</div>
            <div>
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
        </div>
    );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className}`}>{children}</div>;
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

const inputClass = (error?: string) =>
    `w-full max-w-[stretch] px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
        error
            ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
            : 'border-gray-200 bg-gray-50 focus:border-[#14A8DE] focus:bg-white focus:ring-2 focus:ring-[#14A8DE]/20'
    }`;

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AjoutLaverie() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [photos, setPhotos] = useState<PhotoLocale[]>([]);

    // ── Référentiels dynamiques ───────────────────────────────────────────────
    const [servicesDisponibles,  setServicesDisponibles]  = useState<ServiceOption[]>([]);
    const [paiementsDisponibles, setPaiementsDisponibles] = useState<MethodePaiementOption[]>([]);
    const [loadingRef, setLoadingRef] = useState(true);

    useEffect(() => {
        Promise.all([getServices(), getMethodesPaiement()])
            .then(([s, p]) => { setServicesDisponibles(s); setPaiementsDisponibles(p); })
            .catch(() => {/* silencieux — les cases n'apparaîtront pas */})
            .finally(() => setLoadingRef(false));
    }, []);

    // WI-LINE
    const [wiLineLoading, setWiLineLoading]               = useState(false);
    const [wiLineCentrales, setWiLineCentrales]           = useState<WiLineCentrale[]>([]);
    const [wiLineConnecte, setWiLineConnecte]             = useState(false);
    const [wiLineSelectedSerial, setWiLineSelectedSerial] = useState<string>('');

    // ── Formulaire ────────────────────────────────────────────────────────────
    // serviceIds / paiementIds contiennent les IDs sélectionnés (pas les noms)
    const [form, setForm] = useState<FormDataAddLaverie>({
        nomEtablissement: '',
        contactEmail: '',
        description: '',
        rue: '',
        codePostal: '',
        ville: '',
        pays: 'France',
        wiLineApiKey: '',
        wiLineCentraleId: null,
        horaires: defaultHoraires(),
        machines: [],
        equipements: [],
        serviceIds: [],
        paiementIds: [],
    });

    const set = (key: keyof FormDataAddLaverie, value: any) => {
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((e) => ({ ...e, [key]: undefined }));
    };

    const toggleEquipement = (val: string) => {
        setForm((f) => ({
            ...f,
            equipements: f.equipements.includes(val)
                ? f.equipements.filter((v) => v !== val)
                : [...f.equipements, val],
        }));
    };

    const toggleServiceId = (id: number) => {
        setForm((f) => ({
            ...f,
            serviceIds: f.serviceIds.includes(id)
                ? f.serviceIds.filter((v) => v !== id)
                : [...f.serviceIds, id],
        }));
    };

    const togglePaiementId = (id: number) => {
        setForm((f) => ({
            ...f,
            paiementIds: f.paiementIds.includes(id)
                ? f.paiementIds.filter((v) => v !== id)
                : [...f.paiementIds, id],
        }));
    };

    const setHoraire = (jour: string, field: keyof HorairesJour, value: any) => {
        setForm((f) => ({ ...f, horaires: { ...f.horaires, [jour]: { ...f.horaires[jour], [field]: value } } }));
    };

    const addMachine = () => set('machines', [...form.machines, newMachine()]);

    const updateMachine = (id: string, field: keyof Machine, value: string) => {
        setForm((f) => ({ ...f, machines: f.machines.map((m) => (m.id === id ? { ...m, [field]: value } : m)) }));
    };

    const removeMachine = (id: string) => {
        setForm((f) => ({ ...f, machines: f.machines.filter((m) => m.id !== id) }));
    };

    // ── Logo / photos ─────────────────────────────────────────────────────────

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setErrors((er) => ({ ...er, logo: 'Format non autorisé (JPEG, PNG, WebP).' }));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrors((er) => ({ ...er, logo: 'Fichier trop lourd (5 Mo max).' }));
            return;
        }
        setErrors((er) => ({ ...er, logo: undefined }));
        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
        e.target.value = '';
    };

    const supprimerLogo = () => {
        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setLogoFile(null);
        setLogoPreview(null);
    };

    const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const invalides = files.filter(
            (f) => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) || f.size > 5 * 1024 * 1024
        );
        if (invalides.length > 0) {
            setErrors((er) => ({ ...er, photos: `${invalides.length} fichier(s) invalide(s) (format ou taille > 5 Mo).` }));
            e.target.value = '';
            return;
        }
        setErrors((er) => ({ ...er, photos: undefined }));
        const nouvelles: PhotoLocale[] = files.map((file) => ({
            id: crypto.randomUUID(),
            preview: URL.createObjectURL(file),
            file,
        }));
        setPhotos((p) => [...p, ...nouvelles]);
        e.target.value = '';
    };

    const supprimerPhoto = (id: string) => {
        setPhotos((p) => {
            const photo = p.find((ph) => ph.id === id);
            if (photo) URL.revokeObjectURL(photo.preview);
            return p.filter((ph) => ph.id !== id);
        });
    };

    // ── WI-LINE ───────────────────────────────────────────────────────────────

    const connecterWiLine = async () => {
        if (!form.wiLineApiKey.trim()) return;
        setWiLineLoading(true);
        setWiLineConnecte(false);
        setWiLineCentrales([]);
        setErrors((e) => ({ ...e, wiLineApiKey: undefined }));
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/wiline/centrales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ apiKey: form.wiLineApiKey }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message ?? 'Erreur WI-LINE');
            setWiLineCentrales(data.centrales ?? []);
            setWiLineConnecte(true);
        } catch (err: any) {
            setErrors((e) => ({ ...e, wiLineApiKey: err.message }));
        } finally {
            setWiLineLoading(false);
        }
    };

    const selectionnerCentrale = (serial: string) => {
        setWiLineSelectedSerial(serial);
        const centrale = wiLineCentrales.find((c) => c.serial === serial);
        if (!centrale) return;
        set('wiLineCentraleId', centrale.id);
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
        set('machines', machinesImportees);
    };

    const uploadMedias = async (laverieId: number) => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        if (logoFile) {
            const fd = new FormData();
            fd.append('logo', logoFile);
            await fetch(`${API_BASE_URL}/api/laveries/${laverieId}/logo`, { method: 'POST', headers, body: fd });
        }
        for (const photo of photos) {
            const fd = new FormData();
            fd.append('photo', photo.file);
            fd.append('description', '');
            await fetch(`${API_BASE_URL}/api/laveries/${laverieId}/photos`, { method: 'POST', headers, body: fd });
        }
    };

    // ── Validation ────────────────────────────────────────────────────────────

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!form.nomEtablissement.trim()) e.nomEtablissement = 'Le nom est obligatoire.';
        if (!form.rue.trim())             e.rue             = 'La rue est obligatoire.';
        if (!form.codePostal.trim())      e.codePostal      = 'Le code postal est obligatoire.';
        if (!form.ville.trim())           e.ville           = 'La ville est obligatoire.';
        if (!form.pays.trim())            e.pays            = 'Le pays est obligatoire.';
        if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
            e.contactEmail = 'Email invalide.';
        }
        if (!Object.values(form.horaires).some((h) => h.ouvert)) {
            e.horaires = 'Au moins un jour doit être ouvert.';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── Soumission ────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/laveries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    nomEtablissement: form.nomEtablissement,
                    contactEmail:     form.contactEmail || null,
                    description:      form.description || null,
                    rue:              form.rue,
                    codePostal:       form.codePostal,
                    ville:            form.ville,
                    pays:             form.pays,
                    wiLineCentraleId: form.wiLineCentraleId,
                    horaires:         form.horaires,
                    machines:         form.machines,
                    equipements:      form.equipements,
                    // On envoie les IDs, pas les noms
                    serviceIds:       form.serviceIds,
                    paiementIds:      form.paiementIds,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message ?? 'Erreur lors de la création.');
            await uploadMedias(data.id);
            navigate('/profil');
        } catch (err: any) {
            setSubmitError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="w-full max-w-[1280px] bg-gray-50 pt-20 pb-16">
            <div className="mx-auto px-4">

                <div className="mb-8">
                    <button onClick={() => navigate('/profil')} className="p-2 flex items-center gap-2 text-sm text-gray-500 hover:text-[#14A8DE] transition-colors mb-4">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                        Revenir en arrière
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Ajouter une laverie</h1>
                    <p className="text-gray-500 mt-1">Votre fiche sera soumise à validation avant publication.</p>
                </div>

                <div className="space-y-6">

                    {/* ── 1. Informations générales ── */}
                    <Card>
                        <SectionTitle step={1} title="Informations générales" />
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

                    {/* ── 2. Adresse ── */}
                    <Card>
                        <SectionTitle step={2} title="Adresse" subtitle="Champs obligatoires" />
                        <div className="grid grid-cols-1 gap-4">
                            <Field label="Rue" required error={errors.rue}>
                                <input type="text" value={form.rue} onChange={(e) => set('rue', e.target.value)} placeholder="12 rue des Fleurs" className={inputClass(errors.rue)} />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
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

                    {/* ── 3. Horaires ── */}
                    <Card>
                        <SectionTitle step={3} title="Horaires d'ouverture" subtitle="Au moins un jour obligatoire" />
                        {errors.horaires && <p className="text-xs text-red-500 mb-3">{errors.horaires}</p>}
                        <div className="space-y-3 flex-wrap">
                            {JOURS.map((jour) => {
                                const h = form.horaires[jour];
                                return (
                                    <div key={jour} className="flex items-center gap-3 flex-wrap justify-between">
                                        <div className="flex">
                                            <div className="w-24 text-sm font-medium text-gray-700 shrink-0">{jour}</div>
                                            <div onClick={() => setHoraire(jour, 'ouvert', !h.ouvert)} className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${h.ouvert ? 'bg-[#14A8DE]' : 'bg-gray-200'}`}>
                                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${h.ouvert ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500 w-12 shrink-0">{h.ouvert ? 'Ouvert' : 'Fermé'}</span>
                                            {h.ouvert && (
                                                <>
                                                    <input type="time" value={h.ouverture} onChange={(e) => setHoraire(jour, 'ouverture', e.target.value)} className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:border-[#14A8DE] focus:outline-none" />
                                                    <span className="text-gray-400 text-sm shrink-0">→</span>
                                                    <input type="time" value={h.fermeture} onChange={(e) => setHoraire(jour, 'fermeture', e.target.value)} className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:border-[#14A8DE] focus:outline-none" />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* ── 4. Équipements, services & paiements ── */}
                    <Card>
                        <SectionTitle step={4} title="Équipements & services" />
                        <div className="space-y-6">

                            {/* Équipements — statiques */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Équipements</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {EQUIPEMENTS_OPTIONS.map((item) => (
                                        <label key={item} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={form.equipements.includes(item)} onChange={() => toggleEquipement(item)} className="w-4 h-4 rounded border-gray-300 accent-[#14A8DE]" />
                                            <span className="text-sm text-gray-600 group-hover:text-gray-900">{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Services — depuis l'API */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Services proposés</p>
                                {loadingRef ? (
                                    <div className="flex gap-2">
                                        {[...Array(4)].map((_, i) => <div key={i} className="h-6 w-28 bg-gray-100 rounded animate-pulse" />)}
                                    </div>
                                ) : servicesDisponibles.length === 0 ? (
                                    <p className="text-sm text-gray-400">Aucun service disponible.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        {servicesDisponibles.map((s) => (
                                            <label key={s.id} className="flex items-center gap-2 cursor-pointer group">
                                                <input type="checkbox" checked={form.serviceIds.includes(s.id)} onChange={() => toggleServiceId(s.id)} className="w-4 h-4 rounded border-gray-300 accent-[#14A8DE]" />
                                                <span className="text-sm text-gray-600 group-hover:text-gray-900">{s.nom}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Paiements — depuis l'API */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Moyens de paiement</p>
                                {loadingRef ? (
                                    <div className="flex gap-2">
                                        {[...Array(4)].map((_, i) => <div key={i} className="h-6 w-28 bg-gray-100 rounded animate-pulse" />)}
                                    </div>
                                ) : paiementsDisponibles.length === 0 ? (
                                    <p className="text-sm text-gray-400">Aucun moyen de paiement disponible.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        {paiementsDisponibles.map((p) => (
                                            <label key={p.id} className="flex items-center gap-2 cursor-pointer group">
                                                <input type="checkbox" checked={form.paiementIds.includes(p.id)} onChange={() => togglePaiementId(p.id)} className="w-4 h-4 rounded border-gray-300 accent-[#14A8DE]" />
                                                <span className="text-sm text-gray-600 group-hover:text-gray-900">{p.nom}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* ── 5. WI-LINE ── */}
                    <Card>
                        <SectionTitle step={5} title="Centrale WI-LINE" subtitle="Optionnel — importe automatiquement les machines depuis votre centrale" />
                        <div className="flex gap-3 mb-4 flex-wrap">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={form.wiLineApiKey}
                                    onChange={(e) => { set('wiLineApiKey', e.target.value); setWiLineConnecte(false); setWiLineCentrales([]); }}
                                    placeholder="Code client WI-LINE (api_key)"
                                    className={inputClass(errors.wiLineApiKey)}
                                />
                                {errors.wiLineApiKey && <p className="text-xs text-red-500 mt-1">{errors.wiLineApiKey}</p>}
                            </div>
                            <button
                                type="button"
                                onClick={connecterWiLine}
                                disabled={wiLineLoading || !form.wiLineApiKey.trim()}
                                className="px-4 py-2.5 rounded-xl bg-[#14A8DE] text-white text-sm font-medium hover:bg-[#119ac8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                            >
                                {wiLineLoading ? 'Connexion...' : 'Connecter'}
                            </button>
                        </div>

                        {wiLineConnecte && wiLineCentrales.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    ✓ {wiLineCentrales.length} centrale{wiLineCentrales.length > 1 ? 's' : ''} trouvée{wiLineCentrales.length > 1 ? 's' : ''} — sélectionnez celle à associer :
                                </p>
                                <div className="space-y-2">
                                    {wiLineCentrales.map((c) => (
                                        <label key={c.serial} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors hover:bg-gray-50 has-[:checked]:border-[#14A8DE] has-[:checked]:bg-blue-50">
                                            <input type="radio" name="wiline_centrale" value={c.serial} checked={wiLineSelectedSerial === c.serial} onChange={() => selectionnerCentrale(c.serial)} className="accent-[#14A8DE]" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{c.nom}</p>
                                                <p className="text-xs text-gray-400">{c.serial} — {c.machines.length} machine{c.machines.length > 1 ? 's' : ''}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {wiLineSelectedSerial && <p className="text-xs text-green-600 mt-2">✓ {form.machines.length} machine(s) importée(s) dans la section ci-dessous.</p>}
                            </div>
                        )}
                        {wiLineConnecte && wiLineCentrales.length === 0 && (
                            <p className="text-sm text-gray-500">Aucune centrale trouvée pour ce compte.</p>
                        )}
                    </Card>

                    {/* ── 6. Machines ── */}
                    <Card>
                        <div className="flex items-start justify-between mb-6">
                            <SectionTitle step={6} title="Machines" subtitle="Ajoutez vos machines manuellement ou via WI-LINE" />
                            <button type="button" onClick={addMachine} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#14A8DE] text-[#14A8DE] text-sm font-medium hover:bg-[#14A8DE]/5 transition-colors shrink-0">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                                Ajouter
                            </button>
                        </div>
                        {form.machines.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                                <p className="text-sm text-gray-400">Aucune machine ajoutée</p>
                                <p className="text-xs text-gray-300 mt-1">Connectez une centrale WI-LINE ou ajoutez manuellement</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {form.machines.map((machine, idx) => (
                                    <div key={machine.id} className={`p-4 rounded-xl border ${machine.wiline_machine_id ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Machine #{idx + 1}</span>
                                                {machine.wiline_machine_id && <span className="text-xs bg-[#14A8DE]/10 text-[#14A8DE] px-2 py-0.5 rounded-full font-medium">WI-LINE</span>}
                                            </div>
                                            <button type="button" onClick={() => removeMachine(machine.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                            <div className="sm:col-span-1">
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
                                                <input type="text" value={machine.nom} onChange={(e) => updateMachine(machine.id, 'nom', e.target.value)} placeholder="Ex: Machine 1" className="w-full max-w-[stretch] px-2.5 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#14A8DE] focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                                                <select value={machine.type} onChange={(e) => updateMachine(machine.id, 'type', e.target.value)} className="w-full max-w-[stretch] px-2.5 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#14A8DE] focus:outline-none">
                                                    <option value="lave-linge">Lave-linge</option>
                                                    <option value="sèche-linge">Sèche-linge</option>
                                                    <option value="autre">Autre</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Capacité (kg)</label>
                                                <input type="number" value={machine.capacite} onChange={(e) => updateMachine(machine.id, 'capacite', e.target.value)} placeholder="8" className="w-full max-w-[stretch] px-2.5 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#14A8DE] focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Tarif (€)</label>
                                                <input type="number" step="0.10" value={machine.tarif} onChange={(e) => updateMachine(machine.id, 'tarif', e.target.value)} placeholder="4.50" className="w-full max-w-[stretch] px-2.5 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#14A8DE] focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Durée (min)</label>
                                                <input type="number" value={machine.duree} onChange={(e) => updateMachine(machine.id, 'duree', e.target.value)} placeholder="45" className="w-full max-w-[stretch] px-2.5 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#14A8DE] focus:outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* ── 7. Médias ── */}
                    <Card>
                        <SectionTitle step={7} title="Logo & photos" subtitle="JPEG, PNG ou WebP — 5 Mo max par fichier" />
                        <div className="mb-6">
                            <p className="text-sm font-medium text-gray-700 mb-3">Logo de l'établissement</p>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                                    {logoPreview
                                        ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                        : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                                    }
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors w-fit">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                                        {logoPreview ? 'Changer le logo' : 'Importer un logo'}
                                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoChange} className="hidden" />
                                    </label>
                                    {logoPreview && <button type="button" onClick={supprimerLogo} className="text-xs text-red-400 hover:text-red-600 transition-colors text-left">Supprimer le logo</button>}
                                    {errors.logo && <p className="text-xs text-red-500">{errors.logo}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 mb-5" />
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">Photos de la laverie</p>
                            {errors.photos && <p className="text-xs text-red-500 mb-2">{errors.photos}</p>}
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                {photos.map((ph) => (
                                    <div key={ph.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                                        <img src={ph.preview} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                        <button type="button" onClick={() => supprimerPhoto(ph.id)} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                        </button>
                                    </div>
                                ))}
                                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#14A8DE] hover:bg-blue-50/30 transition-colors group">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="group-hover:stroke-[#14A8DE] transition-colors"><path d="M12 5v14M5 12h14"/></svg>
                                    <span className="text-xs text-gray-400 mt-1 group-hover:text-[#14A8DE] transition-colors">Ajouter</span>
                                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotosChange} className="hidden" />
                                </label>
                            </div>
                            {photos.length > 0 && <p className="text-xs text-gray-400 mt-2">{photos.length} photo{photos.length > 1 ? 's' : ''} sélectionnée{photos.length > 1 ? 's' : ''} — envoyées après validation du formulaire.</p>}
                        </div>
                    </Card>

                    {/* ── Erreur globale & submit ── */}
                    {submitError && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                            {submitError}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button type="button" onClick={() => navigate('/profil')} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            Annuler
                        </button>
                        <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-[#14A8DE] text-white text-sm font-semibold hover:bg-[#119ac8] disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                            {isSubmitting ? 'Envoi en cours...' : 'Soumettre pour validation'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}