import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../services/api';
import { getMesFavoris, supprimerFavori, type FavoriLaverie } from '../services/request';

const fallbackLaverieImage = `${API_BASE_URL}/uploads/laveries/01-lave-linge-blanc-1.jpg`;

function HeartIcon({ className = '' }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
			<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A5.965 5.965 0 0116.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
		</svg>
	);
}

export default function MesFavoris() {
	const { t } = useTranslation();
	const [favoris, setFavoris] = useState<FavoriLaverie[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [removingId, setRemovingId] = useState<number | null>(null);

	useEffect(() => {
		getMesFavoris()
			.then((data) => setFavoris(Array.isArray(data.favoris) ? data.favoris : []))
			.catch((err: any) => setError(err?.message || t('main.mes_favoris.erreur')))
			.finally(() => setLoading(false));
	}, [t]);

	const handleSupprimerFavori = async (laverie: FavoriLaverie) => {
		const confirmation = window.confirm(t('main.mes_favoris.retirer_confirm', { nom: laverie.nom }));
		if (!confirmation) {
			return;
		}

		try {
			setRemovingId(laverie.id);
			await supprimerFavori(laverie.id);
			setFavoris((prev) => prev.filter((item) => item.id !== laverie.id));
		} catch (err: any) {
			setError(err?.message || t('main.mes_favoris.erreur_suppression'));
		} finally {
			setRemovingId(null);
		}
	};

	if (loading) {
		return <div className="min-h-screen w-full bg-slate-50 pt-24" aria-busy="true" />;
	}

	if (error) {
		return (
			<div className="min-h-screen w-full bg-slate-50 pt-24 px-5">
				<div className="mx-auto max-w-[1280px] rounded-2xl bg-rose-100 px-4 py-3 text-rose-700" role="alert">{error}</div>
			</div>
		);
	}

	return (
		<div className="w-full bg-slate-50 pt-24 pb-16 px-5 lg:px-0">
			<main className="mx-auto max-w-[1280px]">
				<section className="overflow-hidden rounded-[28px] bg-gradient-to-b from-cyan-500 to-cyan-600 text-white shadow-md">
					<div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
						<div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
							<HeartIcon className="h-7 w-7 text-white" />
						</div>
						<div>
							<h1 className="text-xl font-semibold sm:text-2xl">{t('main.mes_favoris.titre')}</h1>
							<p className="mt-1 text-sm text-white/90">{t('main.mes_favoris.sous_titre')}</p>
						</div>
					</div>
				</section>

				<section className="mt-8 text-center">
					<h2 className="mb-4 text-lg font-bold text-slate-900 sm:text-xl">{t('main.mes_favoris.vos_favorites')}</h2>

					{favoris.length === 0 ? (
						<div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
							<p className="text-sm text-slate-600">{t('main.mes_favoris.pas_encore')}</p>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{favoris.map((laverie) => (
								<article key={laverie.id} className="overflow-hidden rounded-2xl bg-white text-left shadow-sm transition hover:shadow-md">
									<div className="relative h-40 w-full bg-slate-200">
										<img
											src={laverie.image || fallbackLaverieImage}
											alt={laverie.imageAlt || laverie.nom}
											loading="lazy"
											decoding="async"
											className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
										/>
										<button
											type="button"
											onClick={() => handleSupprimerFavori(laverie)}
											disabled={removingId === laverie.id}
											className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
											aria-label={t('main.mes_favoris.retirer_aria', { nom: laverie.nom })}
											aria-busy={removingId === laverie.id}
										>
											<HeartIcon className="h-3.5 w-3.5" />
											{removingId === laverie.id ? t('main.mes_favoris.suppression_en_cours') : t('main.mes_favoris.favori')}
										</button>
									</div>

									<div className="p-4">
										<h3 className="text-base font-bold text-slate-900">{laverie.nom}</h3>
										<p className="mt-1 text-xs text-slate-600 sm:text-sm">{laverie.adresse}</p>

										{laverie.description && <p className="mt-2 line-clamp-2 text-xs text-slate-500 sm:text-sm">{laverie.description}</p>}

										<div className="mt-4 space-y-1 text-xs text-slate-500">
											<p>
												<span className="font-semibold">{t('main.mes_favoris.ajoutee')} :</span>{' '}
												{laverie.dateAjout || t('main.mes_favoris.non_renseignee')}
											</p>
											<p>
												<span className="font-semibold">{t('main.mes_favoris.modifiee')} :</span>{' '}
												{laverie.dateModification || t('main.mes_favoris.non_renseignee')}
											</p>
										</div>
									</div>
								</article>
							))}
						</div>
					)}
				</section>
			</main>
		</div>
	);
}
