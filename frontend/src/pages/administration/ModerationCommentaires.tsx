import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchModerationCommentaires, moderationDecision } from '../../services/request';
import { AccessibleModal } from '../../components/accessibility';

export default function ModerationCommentaires() {
    const { t } = useTranslation();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<number | null>(null);
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
            // refresh
            const res = await fetchModerationCommentaires();
            setItems(res.items || []);
        } catch (e) {
            console.error(e);
        } finally {
            setDecisionPending(false);
        }
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Modération des commentaires</h1>
            {items.length === 0 ? (
                <p>Aucun signalement en attente.</p>
            ) : (
                <div className="space-y-4">
                    {items.map((it: any) => (
                        <div key={it.noteId} className="rounded-lg border p-4 bg-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">Commentaire #{it.noteId} — Laverie #{it.laverieId}</p>
                                    <p className="text-sm text-slate-700 mt-2">{it.commentaire}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => handleDecision(it.noteId, 'keep')} disabled={decisionPending} className="rounded-md border px-3 py-1.5">Garder</button>
                                    <button onClick={() => handleDecision(it.noteId, 'delete')} disabled={decisionPending} className="rounded-md bg-rose-500 text-white px-3 py-1.5">Supprimer</button>
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
