import { useEffect, useState } from 'react';
import { getMesLaveries, LaverieResume } from '../../services/request';

export default function MesLaveries() {
    const [laveries, setLaveries] = useState<LaverieResume[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getMesLaveries()
            .then((data) => setLaveries(data.laveries))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="w-full max-w-[1280px] mx-auto bg-gray-50 pt-20 pb-16 px-5 lg:px-0">
            <h1 className="text-2xl font-bold mb-6">Mes laveries</h1>

            {laveries.length === 0 ? (
                <p className="text-gray-400">Vous n'avez pas encore de laverie.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {laveries.map((laverie) => (
                        <div key={laverie.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className="flex items-start justify-between mb-3">
                                <h2 className="text-base font-semibold text-gray-800">{laverie.nomEtablissement}</h2>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    laverie.statut === 'Validé'      ? 'bg-green-100 text-green-700' :
                                    laverie.statut === 'En attente'  ? 'bg-yellow-100 text-yellow-700' :
                                                                       'bg-red-100 text-red-700'
                                }`}>
                                    {laverie.statut}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">
                                {laverie.adresse.rue}, {laverie.adresse.codePostal} {laverie.adresse.ville}
                            </p>
                            <p className="text-xs text-gray-300 mt-2">
                                Ajoutée le {new Date(laverie.dateAjout).toLocaleDateString('fr-FR')}
                            </p>
                            
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}