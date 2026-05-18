import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Star, Pencil, Trash2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getMesAvis, modifierAvis, supprimerAvis, type AvisUtilisateur } from '../services/request';

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1" role="group" aria-label="Note sur 5">
            {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                    className="transition-transform hover:scale-110 focus-visible:outline-none"
                >
                    <Star
                        className={`h-6 w-6 transition-colors ${
                            star <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
}

function AvisCard({ avis, onUpdated, onDeleted }: {
    avis: AvisUtilisateur;
    onUpdated: (updated: AvisUtilisateur) => void;
    onDeleted: (id: number) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [note, setNote] = useState(avis.note);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (note < 1) { toast.error('Veuillez sélectionner une note'); return; }
        setLoading(true);
        try {
            const updated = await modifierAvis(avis.id, note);
            onUpdated({ ...avis, note: updated.note });
            setEditing(false);
            toast.success('Note modifiée');
        } catch (err: any) {
            toast.error(err?.message || 'Erreur lors de la modification');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await supprimerAvis(avis.id);
            onDeleted(avis.id);
            toast.success('Avis supprimé');
        } catch (err: any) {
            toast.error(err?.message || 'Erreur lors de la suppression');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setNote(avis.note);
        setEditing(false);
        setConfirmDelete(false);
    };

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <Link
                        to={`/laveries/${avis.laverie.id}`}
                        className="text-base font-bold text-slate-900 hover:text-[#14A8DE] transition-colors truncate block"
                    >
                        {avis.laverie.nom}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500 truncate">
                        {[avis.laverie.adresse, avis.laverie.codePostal, avis.laverie.ville].filter(Boolean).join(' • ')}
                    </p>
                </div>
                {!editing && !confirmDelete && (
                    <div className="flex shrink-0 gap-2">
                        <button
                            type="button"
                            onClick={() => setEditing(true)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-[#14A8DE] hover:text-white transition-colors"
                            aria-label="Modifier cet avis"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-rose-500 hover:text-white transition-colors"
                            aria-label="Supprimer cet avis"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {confirmDelete ? (
                <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-4">
                    <p className="text-sm font-medium text-rose-800">Supprimer cet avis définitivement ?</p>
                    <div className="mt-3 flex gap-2">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600 disabled:opacity-60 transition-colors"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Supprimer
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                            Annuler
                        </button>
                    </div>
                </div>
            ) : editing ? (
                <div className="mt-4 space-y-3">
                    <StarPicker value={note} onChange={setNote} />
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-1.5 rounded-lg bg-[#14A8DE] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#119ac8] disabled:opacity-60 transition-colors"
                        >
                            <Check className="h-3.5 w-3.5" />
                            Enregistrer
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                            Annuler
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-3">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < avis.note ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-slate-500">
                            {avis.noteLe ? new Date(avis.noteLe).toLocaleDateString('fr-FR') : ''}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MesAvis() {
    const [avis, setAvis] = useState<AvisUtilisateur[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getMesAvis()
            .then(setAvis)
            .catch((err) => setError(err?.message || 'Impossible de charger vos avis'))
            .finally(() => setLoading(false));
    }, []);

    const handleUpdated = (updated: AvisUtilisateur) => {
        setAvis((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    };

    const handleDeleted = (id: number) => {
        setAvis((prev) => prev.filter((a) => a.id !== id));
    };

    return (
        <div className="min-h-screen bg-slate-50 px-5 pb-16 pt-20 lg:px-0">
            <div className="mx-auto max-w-[720px]">
                <div className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Espace personnel</p>
                    <h1 className="mt-2 text-2xl font-bold text-slate-900">Mes avis & commentaires</h1>
                    <p className="mt-1 text-sm text-slate-500">Gérez les notes et commentaires que vous avez laissés sur des laveries.</p>
                </div>

                {loading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200" />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700" role="alert">
                        {error}
                    </div>
                )}

                {!loading && !error && avis.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
                        <Star className="mx-auto h-10 w-10 text-slate-300" />
                        <p className="mt-4 text-base font-semibold text-slate-700">Aucun avis pour le moment</p>
                        <p className="mt-1 text-sm text-slate-500">Rendez-vous sur la fiche d'une laverie pour laisser votre premier avis.</p>
                        <Link
                            to="/"
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#14A8DE] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#119ac8] transition-colors"
                        >
                            Découvrir des laveries
                        </Link>
                    </div>
                )}

                {!loading && !error && avis.length > 0 && (
                    <div className="space-y-4">
                        {avis.map((a) => (
                            <AvisCard key={a.id} avis={a} onUpdated={handleUpdated} onDeleted={handleDeleted} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
