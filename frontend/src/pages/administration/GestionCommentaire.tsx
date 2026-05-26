import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fetchModerationCommentaires, moderationDecision } from '../../services/request';

export default function GestionCommentaires() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [decisionPending, setDecisionPending] = useState(false);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                setLoading(true);
                const res = await fetchModerationCommentaires();
                if (!active) return;
                setItems(res.items || []);
            } catch (e) {
                console.error(e);
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => { active = false; };
    }, []);

    const handleDecision = async (noteId: number, action: 'keep'|'delete') => {
        try {
            setDecisionPending(true);
            await moderationDecision(noteId, action, action === 'delete' ? 'Supprimé via interface modération' : undefined);
            if (action === 'keep') {
                setItems((prev) => prev.filter((item) => item.noteId !== noteId));
                toast.success('Commentaire rétabli avec succès.');
            } else {
                setItems((prev) => prev.filter((item) => item.noteId !== noteId));
                toast.success('Commentaire masqué avec succès.');
            }
        } catch (e) {
            console.error(e);
            toast.error('Une erreur est survenue.');
        } finally {
            setDecisionPending(false);
        }
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="p-6 mt-16">
            <h1 className="text-2xl font-bold mb-4">Gestion des commentaires</h1>
            {items.length === 0 ? (
                <p>Aucun signalement en attente.</p>
            ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {items.map((it: any) => (
                        <div key={it.noteId} className="rounded-lg border bg-white p-4">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div className="min-w-0">
                                    <p className="font-semibold">Commentaire #{it.noteId} — Laverie #{it.laverieId}</p>
                                    <p className="mt-2 text-sm text-slate-700">{it.commentaire}</p>
                                </div>
                                <div className="flex flex-row gap-2 md:flex-col">
                                    <button onClick={() => handleDecision(it.noteId, 'keep')} disabled={decisionPending} className="rounded-md border px-3 py-1.5 cursor-pointer">Garder</button>
                                    <button onClick={() => handleDecision(it.noteId, 'delete')} disabled={decisionPending} className="rounded-md bg-red-500 px-3 py-1.5 text-white hover:bg-rose-600 cursor-pointer">Supprimer</button>
                                </div>
                            </div>

                            <div className="mt-3">
                                <p className="text-xs font-semibold">Signalements</p>
                                <ul className="mt-2 space-y-2">
                                    {it.signalements.map((s: any, idx: number) => (
                                        <li key={idx} className="text-sm text-slate-600">{s.date} — {s.motif} — {s.commentaire}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}