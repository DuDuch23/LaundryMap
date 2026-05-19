import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Star, Pencil, Trash2, X, Check, ArrowRight, MessageSquare } from 'lucide-react';
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
                    className="transition-transform hover:scale-110 focus-visible:outline-none cursor-pointer"
                >
                    <Star
                        className={`h-7 w-7 transition-colors ${
                            star <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
}

type EditStep = 'note' | 'commentaire';

function AvisCard({ avis, onUpdated, onDeleted }: {
    avis: AvisUtilisateur;
    onUpdated: (updated: AvisUtilisateur) => void;
    onDeleted: (id: number) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [editStep, setEditStep] = useState<EditStep>('note');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [note, setNote] = useState(avis.note);
    const [commentaire, setCommentaire] = useState(avis.commentaire ?? '');
    const [loading, setLoading] = useState(false);

    const startEditing = () => {
        setNote(avis.note);
        setCommentaire(avis.commentaire ?? '');
        setEditStep('note');
        setEditing(true);
    };

    const handleNext = () => {
        if (note < 1) {
            toast.error('Veuillez sélectionner une note');
            return;
        }
        setEditStep('commentaire');
    };

    const handleSave = async () => {
        if (note < 1) { toast.error('Veuillez sélectionner une note'); return; }
        setLoading(true);
        try {
            const trimmed = commentaire.trim();
            const updated = await modifierAvis(avis.id, note, trimmed === '' ? null : trimmed);
            onUpdated({
                ...avis,
                note: updated.note,
                commentaire: updated.commentaire ?? null,
                commenteLe: updated.commenteLe ?? null,
                noteLe: updated.noteLe ?? avis.noteLe,
            });
            setEditing(false);
            setEditStep('note');
            toast.success('Avis modifié');
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
        setCommentaire(avis.commentaire ?? '');
        setEditing(false);
        setEditStep('note');
        setConfirmDelete(false);
    };

    return (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col self-start w-full">
            <div className="flex items-start justify-between gap-4 px-5 pt-5">
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
                            onClick={startEditing}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-[#14A8DE] hover:text-white transition-colors cursor-pointer"
                            aria-label="Modifier cet avis"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                            aria-label="Supprimer cet avis"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {confirmDelete ? (
                <div className="mx-5 mt-4 mb-5 rounded-xl bg-rose-50 border border-rose-200 p-4">
                    <p className="text-sm font-medium text-rose-800">Supprimer cet avis définitivement ?</p>
                    <div className="mt-3 flex gap-2">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600 disabled:opacity-60 transition-colors cursor-pointer"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Supprimer
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            <X className="h-3.5 w-3.5" />
                            Annuler
                        </button>
                    </div>
                </div>
            ) : editing ? (
                <div className="px-5 pt-4 pb-5 space-y-4 flex-1 flex flex-col">
                    {/* Indicateur d'étape */}
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        <span className={editStep === 'note' ? 'text-[#14A8DE]' : ''}>1. Note</span>
                        <span className="text-slate-300">/</span>
                        <span className={editStep === 'commentaire' ? 'text-[#14A8DE]' : ''}>2. Commentaire</span>
                    </div>

                    {editStep === 'note' ? (
                        <>
                            <div className="flex-1">
                                <p className="mb-2 text-sm font-medium text-slate-700">Votre note</p>
                                <StarPicker value={note} onChange={setNote} />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={loading}
                                    className="flex items-center gap-1.5 rounded-lg bg-[#14A8DE] px-4 py-2 text-xs font-semibold text-white hover:bg-[#119ac8] disabled:opacity-60 transition-colors cursor-pointer"
                                >
                                    Suivant
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Annuler
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex-1">
                                <label htmlFor={`commentaire-${avis.id}`} className="mb-2 block text-sm font-medium text-slate-700">
                                    Votre commentaire <span className="text-slate-400 font-normal">(facultatif)</span>
                                </label>
                                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-[#14A8DE] focus-within:ring-2 focus-within:ring-[#14A8DE]/20 transition-colors">
                                    <textarea
                                        id={`commentaire-${avis.id}`}
                                        rows={4}
                                        maxLength={1000}
                                        value={commentaire}
                                        onChange={(e) => setCommentaire(e.target.value)}
                                        placeholder="Partagez votre expérience…"
                                        className="block w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none border-0 p-0"
                                    />
                                </div>
                                <p className="mt-1 text-right text-[11px] text-slate-400">{commentaire.length}/1000</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex items-center gap-1.5 rounded-lg bg-[#14A8DE] px-4 py-2 text-xs font-semibold text-white hover:bg-[#119ac8] disabled:opacity-60 transition-colors cursor-pointer"
                                >
                                    <Check className="h-3.5 w-3.5" />
                                    Enregistrer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditStep('note')}
                                    disabled={loading}
                                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    Retour
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Annuler
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="px-5 pt-3 pb-5 flex-1 flex flex-col">
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

                    {avis.commentaire ? (
                        <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
                            <p className="text-sm text-slate-700 whitespace-pre-line break-words">{avis.commentaire}</p>
                            {avis.commenteLe && (
                                <p className="mt-2 text-[11px] text-slate-400">
                                    Commenté le {new Date(avis.commenteLe).toLocaleDateString('fr-FR')}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400 italic">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Aucun commentaire pour cet avis.
                        </p>
                    )}
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
        <div className="min-h-screen bg-slate-50 px-5 pb-16 pt-20 lg:px-10 xl:px-16">
            <div className="mx-auto w-full max-w-[1200px]">
                <div className="mb-8 lg:mb-12 lg:flex lg:items-end lg:justify-between lg:gap-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Espace personnel</p>
                        <h1 className="mt-2 text-2xl lg:text-3xl font-bold text-slate-900">Mes avis & commentaires</h1>
                        <p className="mt-1 text-sm text-slate-500 lg:max-w-2xl">
                            Gérez les notes et commentaires que vous avez laissés sur des laveries.
                        </p>
                    </div>
                    {!loading && !error && avis.length > 0 && (
                        <div className="mt-4 lg:mt-0 inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm self-start lg:self-auto">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {avis.length} avis publié{avis.length > 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 xl:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-200" />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700" role="alert">
                        {error}
                    </div>
                )}

                {!loading && !error && avis.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 lg:p-16 text-center">
                        <Star className="mx-auto h-10 w-10 lg:h-14 lg:w-14 text-slate-300" />
                        <p className="mt-4 text-base lg:text-lg font-semibold text-slate-700">Aucun avis pour le moment</p>
                        <p className="mt-1 text-sm text-slate-500">Rendez-vous sur la fiche d'une laverie pour laisser votre premier avis.</p>
                        <Link
                            to="/"
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#14A8DE] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#119ac8] transition-colors cursor-pointer"
                        >
                            Découvrir des laveries
                        </Link>
                    </div>
                )}

                {!loading && !error && avis.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 xl:grid-cols-3">
                        {avis.map((a) => (
                            <AvisCard key={a.id} avis={a} onUpdated={handleUpdated} onDeleted={handleDeleted} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
