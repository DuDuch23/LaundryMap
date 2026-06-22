import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Pencil, Plus, Search, ShieldOff, Trash2, X } from 'lucide-react';
import {
    fetchMotsInterdits,
    creerMotInterdit,
    modifierMotInterdit,
    supprimerMotInterdit,
    type MotInterdit,
    type PaginationInfo,
} from '../../services/request';
import { toast } from 'sonner';

function ListeSkeleton() {
    return (
        <div className="space-y-3 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm"
                    style={{ opacity: 1 - i * 0.12 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded-md bg-gray-100" />
                        <div className="h-4 rounded bg-gray-100" style={{ width: `${60 + (i % 4) * 25}px` }} />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-8 w-8 rounded-xl bg-gray-100" />
                        <div className="h-8 w-8 rounded-xl bg-gray-100" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-8 py-16 text-center shadow-sm">
            <ShieldOff className="mb-4 h-12 w-12 text-gray-300" />
            <p className="text-base font-bold text-gray-700">Aucun mot interdit</p>
            <p className="mt-1.5 max-w-xs text-sm text-gray-400">
                La liste noire est vide. Ajoutez des mots pour activer le filtrage automatique des commentaires.
            </p>
            <button
                type="button"
                onClick={onAdd}
                className="mt-6 flex items-center gap-2 rounded-xl bg-[#14A8DE] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1296c8] transition-colors cursor-pointer"
            >
                <Plus size={16} />
                Ajouter le premier mot
            </button>
        </div>
    );
}

function NoResults({ q, onClear }: { q: string; onClear: () => void }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">
                Aucun résultat pour{' '}
                <span className="font-bold text-gray-700">"{q}"</span>
            </p>
            <button
                type="button"
                onClick={onClear}
                className="mt-3 text-sm text-[#14A8DE] hover:underline cursor-pointer"
            >
                Effacer le filtre
            </button>
        </div>
    );
}

export default function MotsInterdits() {
    const [mots, setMots] = useState<MotInterdit[]>([]);
    const [chargement, setChargement] = useState(true);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);

    const [page, setPage] = useState(1);

    const [inputRecherche, setInputRecherche] = useState('');
    const [recherche, setRecherche] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [showAddForm, setShowAddForm] = useState(false);
    const [addLabel, setAddLabel] = useState('');
    const [addPending, setAddPending] = useState(false);
    const addInputRef = useRef<HTMLInputElement>(null);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editLabel, setEditLabel] = useState('');
    const [editPending, setEditPending] = useState(false);
    const editInputRef = useRef<HTMLInputElement>(null);

    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [deletePending, setDeletePending] = useState(false);

    useEffect(() => {
        if (showAddForm) setTimeout(() => addInputRef.current?.focus(), 50);
    }, [showAddForm]);

    useEffect(() => {
        if (editingId !== null) setTimeout(() => editInputRef.current?.focus(), 50);
    }, [editingId]);

    const charger = useCallback(async (targetPage: number, q: string) => {
        setChargement(true);
        try {
            const data = await fetchMotsInterdits(targetPage, q || undefined);
            // Page vide suite à une suppression : reculer vers la dernière page disponible
            if (data.mots.length === 0 && targetPage > 1 && data.pagination.totalResultats > 0) {
                const fallback = Math.max(1, data.pagination.totalPages);
                setPage(fallback);
                return; // le changement de `page` déclenchera le useEffect
            }
            setMots(data.mots);
            setPagination(data.pagination);
        } catch {
            toast.error('Impossible de charger la liste des mots interdits.');
        } finally {
            setChargement(false);
        }
    }, []);

    // Déclenché à chaque changement de page OU de recherche debounced
    useEffect(() => {
        charger(page, recherche);
    }, [page, recherche]);

    const handleInputRechercheChange = (value: string) => {
        setInputRecherche(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            // React 18 batch : les deux setState s'appliquent ensemble → un seul effet
            setPage(1);
            setRecherche(value);
        }, 300);
    };

    const clearSearch = () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setInputRecherche('');
        setPage(1);
        setRecherche('');
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Ferme toutes les interactions ouvertes.
    // IMPORTANT : doit être appelé AVANT d'ouvrir une nouvelle interaction
    // pour éviter l'écrasement par React batching (la dernière écriture gagne).
    // ─────────────────────────────────────────────────────────────────────────
    const closeAll = () => {
        setEditingId(null);
        setEditLabel('');
        setConfirmDeleteId(null);
        setShowAddForm(false);
        setAddLabel('');
    };

    const openAdd = () => { closeAll(); setShowAddForm(true); };
    const cancelAdd = () => { setShowAddForm(false); setAddLabel(''); };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const label = addLabel.trim();
        if (!label) return;
        setAddPending(true);
        try {
            const nouveau = await creerMotInterdit(label);
            toast.success(`"${nouveau.label}" ajouté à la liste noire.`);
            setAddLabel('');
            setShowAddForm(false);
            // Retour page 1 sans filtre pour retrouver le mot dans la liste
            if (page === 1 && recherche === '') {
                // Les états ne changent pas → l'effet ne se relancera pas → appel direct
                charger(1, '');
            } else {
                clearSearch(); // déclenche useEffect via setPage(1) + setRecherche('')
            }
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Erreur lors de l'ajout.");
        } finally {
            setAddPending(false);
        }
    };

    const openEdit = (mot: MotInterdit) => { closeAll(); setEditingId(mot.id); setEditLabel(mot.label); };
    const cancelEdit = () => { setEditingId(null); setEditLabel(''); };

    const handleEdit = async (e: React.FormEvent, id: number) => {
        e.preventDefault();
        const label = editLabel.trim();
        if (!label) return;
        setEditPending(true);
        try {
            const updated = await modifierMotInterdit(id, label);
            toast.success(`Mot mis à jour en "${updated.label}".`);
            setEditingId(null);
            charger(page, recherche); // rafraîchit la page courante
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Erreur lors de la modification.');
        } finally {
            setEditPending(false);
        }
    };

    // ── Suppression ────────────────────────────────────────────────────────────
    // closeAll() doit être appelé AVANT setConfirmDeleteId pour ne pas être écrasé
    const openConfirmDelete = (id: number) => { closeAll(); setConfirmDeleteId(id); };

    const handleDelete = async (id: number) => {
        const mot = mots.find((m) => m.id === id);
        setDeletePending(true);
        try {
            await supprimerMotInterdit(id);
            toast.success(mot ? `"${mot.label}" supprimé.` : 'Mot supprimé.');
            setConfirmDeleteId(null);
            charger(page, recherche); // charger gère le recul de page si elle devient vide
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
        } finally {
            setDeletePending(false);
        }
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAll(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const allerPageSuivante   = () => { if (pagination?.aPageSuivante)   setPage((p) => p + 1); };
    const allerPagePrecedente = () => { if (pagination?.aPagePrecedente) setPage((p) => p - 1); };

    const totalResultats = pagination?.totalResultats ?? 0;
    const hasSearch      = recherche.trim().length > 0;

    return (
        <div className="w-full pt-24 px-4 pb-16 font-sans max-w-[stretch]">

            <div className="bg-white flex items-center justify-between p-4 shadow-sm mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-bold">Mots interdits</h1>
                </div>

                <button
                    type="button"
                    onClick={openAdd}
                    disabled={showAddForm}
                    className="bg-[#14A8DE] text-white p-1.5 rounded-md hover:bg-[#1296c8] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-label="Ajouter un mot interdit"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="px-4">

                {!chargement && totalResultats > 0 && (
                    <p className="text-sm text-gray-500 mb-4">
                        {hasSearch
                            ? `${totalResultats} résultat${totalResultats > 1 ? 's' : ''} pour "${inputRecherche}"`
                            : `${totalResultats} mot${totalResultats > 1 ? 's' : ''} dans la liste noire`
                        }
                    </p>
                )}

                {showAddForm && (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-4 overflow-hidden">
                        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                            <p className="text-sm font-bold text-gray-800">Nouveau mot interdit</p>
                            <p className="text-xs text-gray-400 mt-0.5">Il sera automatiquement mis en minuscules.</p>
                        </div>
                        <form onSubmit={handleAdd} className="p-4">
                            <div className="flex gap-2">
                                <input
                                    ref={addInputRef}
                                    type="text"
                                    value={addLabel}
                                    onChange={(e) => setAddLabel(e.target.value)}
                                    placeholder="ex : insulte, vulgarité, spam…"
                                    maxLength={255}
                                    disabled={addPending}
                                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-mono text-gray-800 placeholder:text-gray-300 placeholder:font-sans focus:border-[#14A8DE] focus:outline-none focus:ring-2 focus:ring-[#14A8DE]/20 disabled:opacity-50 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={addPending || !addLabel.trim()}
                                    className="flex items-center gap-1.5 rounded-xl bg-[#14A8DE] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1296c8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                    <Check size={16} />
                                    <span className="hidden sm:inline">Ajouter</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelAdd}
                                    disabled={addPending}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
                                    aria-label="Annuler"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            {addLabel.length > 200 && (
                                <p className="mt-1.5 text-right text-xs text-gray-400">{addLabel.length}/255</p>
                            )}
                        </form>
                    </div>
                )}

                    <div className="relative mb-4">
                        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="search"
                            value={inputRecherche}
                            onChange={(e) => handleInputRechercheChange(e.target.value)}
                            placeholder="Rechercher un mot…"
                            className="w-[stretch] rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#14A8DE] focus:outline-none focus:ring-2 focus:ring-[#14A8DE]/20 shadow-sm transition-colors"
                        />
                        {inputRecherche && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors cursor-pointer"
                                aria-label="Effacer la recherche"
                            >
                                <X size={10} />
                            </button>
                        )}
                    </div>

                {chargement ? (
                    <ListeSkeleton />
                ) : totalResultats === 0 && !hasSearch ? (
                    <EmptyState onAdd={openAdd} />
                ) : mots.length === 0 ? (
                    <NoResults q={inputRecherche} onClear={clearSearch} />
                ) : (
                    <div className="space-y-3">
                        {mots.map((mot) => {
                            const isEditing       = editingId === mot.id;
                            const isConfirmDelete  = confirmDeleteId === mot.id;

                            return (
                                <div
                                    key={mot.id}
                                    className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-colors ${
                                        isConfirmDelete
                                            ? 'border-red-200 bg-red-50/30'
                                            : isEditing
                                            ? 'border-[#14A8DE]/40'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 px-4 py-3">

                                        {isEditing ? (
                                            <form
                                                onSubmit={(e) => handleEdit(e, mot.id)}
                                                className="flex flex-1 items-center gap-2"
                                            >
                                                <input
                                                    ref={editInputRef}
                                                    type="text"
                                                    value={editLabel}
                                                    onChange={(e) => setEditLabel(e.target.value)}
                                                    maxLength={255}
                                                    disabled={editPending}
                                                    className="flex-1 rounded-xl border border-[#14A8DE]/40 bg-white px-3 py-1.5 text-sm font-mono text-gray-800 focus:border-[#14A8DE] focus:outline-none focus:ring-2 focus:ring-[#14A8DE]/20 disabled:opacity-50 transition-colors"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={editPending || !editLabel.trim() || editLabel.trim() === mot.label}
                                                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#14A8DE] text-white hover:bg-[#1296c8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                                    aria-label="Enregistrer"
                                                >
                                                    <Check size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelEdit}
                                                    disabled={editPending}
                                                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                                                    aria-label="Annuler"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </form>
                                        ) : (
                                            <>
                                                <span className="flex-1 truncate text-sm font-mono font-medium text-gray-800">
                                                    {mot.label}
                                                </span>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(mot)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
                                                        aria-label={`Modifier "${mot.label}"`}
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openConfirmDelete(mot.id)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                                                        aria-label={`Supprimer "${mot.label}"`}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {isConfirmDelete && (
                                        <div className="border-t border-red-100 px-4 py-3 bg-red-50/50">
                                            <p className="text-sm text-red-700 mb-3">
                                                Supprimer{' '}
                                                <span className="font-mono font-bold">"{mot.label}"</span>
                                                {' '}définitivement ?
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(mot.id)}
                                                    disabled={deletePending}
                                                    className="flex items-center gap-1.5 rounded-xl bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={12} />
                                                    Supprimer
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmDeleteId(null)}
                                                    disabled={deletePending}
                                                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                                                >
                                                    <X size={12} />
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <div className="flex items-center justify-between px-1 pt-1 pb-2">
                            <p className="text-xs text-gray-400">
                                {hasSearch
                                    ? `${totalResultats} résultat${totalResultats > 1 ? 's' : ''}`
                                    : `${totalResultats} mot${totalResultats > 1 ? 's' : ''} au total`
                                }
                            </p>
                            {!hasSearch && (
                                <button
                                    type="button"
                                    onClick={openAdd}
                                    disabled={showAddForm}
                                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#14A8DE] hover:bg-[#14A8DE]/10 disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                    <Plus size={12} />
                                    Ajouter
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <button
                            onClick={allerPagePrecedente}
                            disabled={!pagination.aPagePrecedente}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-colors shadow-sm ${
                                pagination.aPagePrecedente
                                    ? 'bg-[#22ACE2] hover:bg-blue-500 text-white cursor-pointer'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            Précédent
                        </button>

                        <span className="text-sm text-gray-500 font-medium">
                            {pagination.pageCourante} / {pagination.totalPages}
                        </span>

                        <button
                            onClick={allerPageSuivante}
                            disabled={!pagination.aPageSuivante}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-colors shadow-sm ${
                                pagination.aPageSuivante
                                    ? 'bg-[#22ACE2] hover:bg-blue-500 text-white cursor-pointer'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Suivant
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
