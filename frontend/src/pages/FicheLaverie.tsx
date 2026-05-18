import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import {
	CheckCircle2,
	Clock3,
	Heart,
	LayoutGrid,
	MapPin,
	MessageSquare,
	Navigation,
	Share2,
	Star,
	Weight,
} from 'lucide-react';
import { AccessibleButton, SkipLink } from '../components/accessibility';
import API_BASE_URL, { uploadPath, resolveUrl } from '../services/api';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { fetchPublicLaverieDetail, ajouterFavori, supprimerFavori, type LaveriePublicDetail } from '../services/request';

const fallbackLaverieImage = uploadPath('/uploads/laveries/default-laundry.jpg');

interface UserTokenPayload {
	id: number;
	roles: string[];
	email?: string;
}

function getUserFromToken(): UserTokenPayload | null {
	const token = localStorage.getItem('token');
	if (!token) return null;
	try {
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			window.atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
		);
		const decoded = JSON.parse(jsonPayload);
		return {
			id: decoded.id,
			roles: decoded.roles || [],
			email: decoded.email,
		};
	} catch (e) {
		return null;
	}
}

function formatDistance(distance: number | null): string {
	if (distance === null) {
		return 'Distance non disponible';
	}

	return distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`;
}

function groupHoraires(horaires: LaveriePublicDetail['horaires']) {
	const groupes: Array<{ jours: string[]; debut: string; fin: string; ferme: boolean }> = [];

	for (const horaire of horaires) {
		const precedent = groupes[groupes.length - 1];
		if (precedent && precedent.debut === horaire.debut && precedent.fin === horaire.fin && precedent.ferme === horaire.ferme) {
			precedent.jours.push(horaire.jour);
		} else {
			groupes.push({ jours: [horaire.jour], debut: horaire.debut, fin: horaire.fin, ferme: horaire.ferme });
		}
	}

	return groupes;
}

function getJourLabel(jour: string): string {
	return jour;
}

function getCurrentDayLabel(): string {
	return new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date()).replace(/^./, (char) => char.toUpperCase());
}

function getCurrentTimeMinutes(): number {
	const now = new Date();
	return now.getHours() * 60 + now.getMinutes();
}

function parseTimeToMinutes(time: string): number | null {
	const [hours, minutes] = time.split(':').map(Number);
	if (Number.isNaN(hours) || Number.isNaN(minutes)) {
		return null;
	}

	return hours * 60 + minutes;
}

function isOpenNow(laverie: LaveriePublicDetail): boolean {
	const today = getCurrentDayLabel();
	const currentMinutes = getCurrentTimeMinutes();
	const todayHours = laverie.horaires.find((horaire) => horaire.jour === today);

	if (!todayHours || todayHours.ferme) {
		return false;
	}

	const start = parseTimeToMinutes(todayHours.debut);
	const end = parseTimeToMinutes(todayHours.fin);
	if (start === null || end === null) {
		return false;
	}

	return currentMinutes >= start && currentMinutes <= end;
}

function buildMapsLink(laverie: LaveriePublicDetail): string {
	if (laverie.latitude !== null && laverie.longitude !== null) {
		return `https://www.google.com/maps?q=${laverie.latitude},${laverie.longitude}`;
	}

	const adresse = [laverie.adresse, laverie.codePostal, laverie.ville].filter(Boolean).join(', ');
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresse)}`;
}

export default function FicheLaverie() {
	const { id } = useParams<{ id: string }>();
	const [laverie, setLaverie] = useState<LaveriePublicDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [shareFeedback, setShareFeedback] = useState<string | null>(null);
	const [isFavorite, setIsFavorite] = useState(false);
	const [favoritePending, setFavoritePending] = useState(false);
	const [accessDeniedReason, setAccessDeniedReason] = useState<string | null>(null);

	const userToken = useMemo(() => getUserFromToken(), []);

	const isProfessionnel = useMemo(() => {
		return userToken ? userToken.roles.some((r: string) => r.includes('PROFESSIONNEL')) : false;
	}, [userToken]);

	useEffect(() => {
		let active = true;

		const fetchLaverie = async () => {
			try {
				setLoading(true);
				setError(null);
				setAccessDeniedReason(null);

				if (!id) {
					throw new Error('Identifiant de laverie manquant.');
				}

				const data = await fetchPublicLaverieDetail(id);

				if (!active) {
					return;
				}

				setLaverie(data);
				
				// Vérifier si l'utilisateur est connecté et si c'est un favori
				const token = localStorage.getItem('token');
				if (token) {
					try {
						const favResponse = await fetch(`${API_BASE_URL}/api/profil/favoris`, {
							method: 'GET',
							headers: {
								accept: 'application/json',
								Authorization: `Bearer ${token}`,
							},
						});
						if (favResponse.ok) {
							const favData = await favResponse.json();
							const isFav = favData.favoris?.some((fav: any) => fav.id === data.id) ?? false;
							if (active) setIsFavorite(isFav);
						}
					} catch {}
				}
			} catch (err: any) {
				if (active) {
					// Déterminer la raison de l'erreur basée sur le statut de la réponse
					if (err?.status === 404) {
						// C'est une laverie non trouvée, probablement accès refusé
						setAccessDeniedReason('accès_refusé');
						setError('Vous n\'avez pas accès à cette fiche laverie.');
					} else {
						setError(err?.message || 'Impossible de charger la fiche de la laverie.');
					}
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		fetchLaverie();

		return () => {
			active = false;
		};
	}, [id]);

	const openLabel = useMemo(() => {
		if (!laverie) {
			return null;
		}

		return isOpenNow(laverie) ? 'Ouverte maintenant' : 'Fermée maintenant';
	}, [laverie]);

	const heroImage = resolveUrl(laverie?.image || fallbackLaverieImage);
	const images = useMemo(() => {
		if (!laverie) return [];
		const list = laverie.images.length > 0 ? laverie.images.map((image) => resolveUrl(image.image)) : [heroImage];
		return [...list, fallbackLaverieImage, fallbackLaverieImage].slice(0, 3);
	}, [laverie, heroImage]);

	const horairesGroupes = useMemo(() => (laverie ? groupHoraires(laverie.horaires) : []), [laverie]);

	const handleShare = async () => {
		if (!laverie) return;

		const shareData = {
			title: laverie.nom,
			text: `${laverie.nom} — ${[laverie.adresse, laverie.codePostal, laverie.ville].filter(Boolean).join(', ')}`,
			url: window.location.href,
		};

		try {
			if (navigator.share) {
				await navigator.share(shareData);
				return;
			}

			await navigator.clipboard.writeText(window.location.href);
			setShareFeedback('Lien copié');
			window.setTimeout(() => setShareFeedback(null), 1800);
		} catch {
			setShareFeedback('Partage indisponible');
			window.setTimeout(() => setShareFeedback(null), 1800);
		}
	};

	const handleToggleFavorite = async () => {
		if (!laverie || favoritePending) return;

		const token = localStorage.getItem('token');
		if (!token) {
			setShareFeedback('Veuillez vous connecter pour ajouter aux favoris');
			window.setTimeout(() => setShareFeedback(null), 2000);
			return;
		}

		try {
			setFavoritePending(true);

			if (isFavorite) {
				await supprimerFavori(laverie.id);
				setIsFavorite(false);
				toast.info('Retiré des favoris');
			} else {
				await ajouterFavori(laverie.id);
				setIsFavorite(true);
				toast.success('Ajouté aux favoris');
			}
		} catch (err: any) {
			setShareFeedback(err?.message || 'Erreur');
			window.setTimeout(() => setShareFeedback(null), 2000);
		} finally {
			setFavoritePending(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-slate-50 px-5 pb-16 pt-20 lg:px-5">
				<div className="mx-auto max-w-[1280px] overflow-hidden rounded-[28px] bg-white shadow-sm" aria-busy="true" aria-live="polite" role="status">
					<div className="animate-pulse">
						<div className="h-72 bg-slate-200 sm:h-[28rem]" />
						<div className="p-5 sm:p-8">
							<div className="h-6 w-2/3 rounded-full bg-slate-200" />
							<div className="mt-4 h-4 w-full rounded-full bg-slate-100" />
							<div className="mt-2 h-4 w-5/6 rounded-full bg-slate-100" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		const isAdmin = userToken?.roles.some((r: string) => r.includes('ADMIN'));
		const isPro = userToken?.roles.some((r: string) => r.includes('PROFESSIONNEL'));

		let fullMessage = error;
		if (accessDeniedReason === 'accès_refusé') {
			if (!userToken) {
				fullMessage = 'Cette fiche laverie n\'est pas accessible au public. Connectez-vous en tant qu\'administrateur ou professionnel pour y accéder.';
			} else if (!isAdmin && !isPro) {
				fullMessage = 'Cette fiche laverie n\'est pas accessible avec votre compte utilisateur. Seuls les administrateurs et les professionnels peuvent la consulter.';
			} else {
				fullMessage = 'Vous n\'avez pas accès à cette fiche laverie. Vous devez être administrateur ou le professionnel propriétaire.';
			}
		}

		return (
			<div className="min-h-screen w-full bg-slate-50 px-5 pt-20 lg:px-5">
				<div className="mx-auto max-w-[1280px] rounded-2xl bg-rose-100 px-4 py-3 text-rose-700" role="alert" aria-live="assertive">
					{fullMessage}
				</div>
			</div>
		);
	}

	if (!laverie) {
		return (
			<div className="min-h-screen w-full bg-slate-50 px-5 pt-20 lg:px-5">
				<div className="mx-auto max-w-[1280px] rounded-[28px] bg-white p-8 text-center shadow-sm">
					<p className="text-base font-semibold text-slate-900">Laverie introuvable.</p>
					<p className="mt-2 text-sm text-slate-500">Cette fiche n’est plus disponible.</p>
				</div>
			</div>
		);
	}

	return (
		<>
		<div className="bg-slate-50 px-5 pb-16 pt-16 sm:pt-20 lg:px-5 lg:pt-24">
			<SkipLink />
			<main id="main-content" role="main" tabIndex={-1} className="mx-auto max-w-[1280px] pt-10">
				<section className="overflow-hidden rounded-[28px] bg-white shadow-sm" aria-labelledby="fiche-laverie-titre">
					<div className="grid lg:grid-cols-[1.35fr_0.95fr]">
						<div className="relative min-h-[22rem] bg-slate-100 sm:min-h-[28rem] lg:min-h-[40rem]">
							<img src={heroImage} alt={laverie.nom} className="h-full w-full object-cover" loading="eager" decoding="async" />

							<div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/18 to-transparent" />

							<div className="absolute left-4 right-4 top-4 flex items-center justify-end gap-3 sm:left-5 sm:right-5">
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={handleShare}
										className="cursor-pointer inline-flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500 text-white backdrop-blur-sm transition hover:bg-cyan-600 shadow-lg"
										aria-label="Partager"
									>
										<Share2 className="h-5 w-5" />
									</button>
									{!isProfessionnel && (
										<button
											type="button"
											onClick={handleToggleFavorite}
											disabled={favoritePending}
											className={`cursor-pointer inline-flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm transition disabled:opacity-60 shadow-lg ${
												isFavorite
													? 'bg-rose-500 text-white ring-1 ring-rose-300/60 hover:bg-rose-600 hover:scale-105'
													: 'bg-white/90 text-rose-500 hover:bg-rose-50 hover:scale-105'
											}`}
											aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
										>
											<Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : 'stroke-[2.25]'}`} />
										</button>
									)}
								</div>
							</div>

						<div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
							<div className="flex flex-wrap items-center gap-2">
									<span className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
										{openLabel}
									</span>
									<span className="rounded-full bg-white/18 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
										<Star className="mr-1 inline h-3.5 w-3.5 text-amber-300" />
										{(laverie.noteMoyenne ?? 0).toFixed(1)} / 5
									</span>
									<span className="rounded-full bg-white/18 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
										{laverie.commentairesCount} avis
									</span>
								</div>

								<h1 id="fiche-laverie-titre" className="mt-3 max-w-xl text-3xl font-extrabold leading-none text-white sm:text-4xl lg:text-5xl">
									{laverie.nom}
								</h1>
							</div>
						</div>

						<div className="flex flex-col gap-5">
							<div className="px-5 pt-4 sm:px-8 sm:pt-5">
								<p className="flex items-start gap-2 text-sm text-slate-600 sm:text-base">
									<MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-600" />
									<span>
										{[laverie.adresse, laverie.codePostal, laverie.ville].filter(Boolean).join(' • ')}
									</span>
								</p>
							</div>

							<div className="flex flex-col gap-5 p-5 sm:p-6 lg:p-8">
							<div className="rounded-[24px] border border-slate-100 bg-slate-50 p-5 shadow-sm" aria-labelledby="presentation-title">
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Présentation</p>
								<p id="presentation-title" className="mt-3 text-sm leading-6 text-slate-600">
									{laverie.description || 'Description non renseignée pour le moment.'}
								</p>

								<div className="mt-5 grid grid-cols-2 gap-3">
									<div className="rounded-2xl bg-white p-4 shadow-sm">
										<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Distance</p>
										<p className="mt-2 text-base font-bold text-slate-900">{formatDistance(laverie.distance)}</p>
									</div>
									<div className="rounded-2xl bg-white p-4 shadow-sm">
										<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Avis</p>
										<p className="mt-2 text-base font-bold text-slate-900">{(laverie.noteMoyenne ?? 0).toFixed(1)} / 5</p>
									</div>
									<div className="rounded-2xl bg-white p-4 shadow-sm">
										<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Commentaires</p>
										<p className="mt-2 text-base font-bold text-slate-900">{laverie.commentairesCount}</p>
									</div>
									<div className="rounded-2xl bg-white p-4 shadow-sm">
										<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Statut</p>
										<p className="mt-2 inline-flex items-center gap-1 text-base font-bold text-slate-900">
											<CheckCircle2 className={`h-4 w-4 ${isOpenNow(laverie) ? 'text-emerald-500' : 'text-rose-500'}`} />
											{openLabel}
										</p>
									</div>
								</div>

								{shareFeedback && <p className="mt-4 text-xs font-medium text-cyan-700">{shareFeedback}</p>}
							</div>

							<div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm" aria-labelledby="horaires-title">
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Horaires</p>
								<h2 id="horaires-title" className="sr-only">Horaires de la laverie</h2>
								<div className="mt-4 space-y-3">
									{horairesGroupes.length > 0 ? horairesGroupes.map((ligne) => (
										<div key={`${ligne.jours.join('-')}-${ligne.debut}-${ligne.fin}`} className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
											<div>
												<p className="text-sm font-semibold text-slate-900">
													{ligne.jours.length > 1 ? `${getJourLabel(ligne.jours[0])} - ${getJourLabel(ligne.jours[ligne.jours.length - 1])}` : getJourLabel(ligne.jours[0])}
												</p>
												<p className="mt-1 text-xs text-slate-500">{ligne.ferme ? 'Fermée' : 'Ouverture continue'}</p>
											</div>
											<p className="text-sm font-semibold text-slate-700">
												{ligne.ferme ? 'Fermée' : `${ligne.debut} - ${ligne.fin}`}
											</p>
										</div>
									)) : (
										<div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500" role="status" aria-live="polite">
											Horaires non renseignés.
										</div>
									)}
								</div>
							</div>
							</div>
						</div>
					</div>
				</section>

					<section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]" aria-labelledby="galerie-title">
						<div className="rounded-[28px] bg-white p-5 shadow-sm sm:p-6">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Images</p>
									<h2 id="galerie-title" className="mt-2 text-lg font-bold text-slate-900">Galerie de la laverie</h2>
							</div>
								<LayoutGrid className="h-5 w-5 text-cyan-600" aria-hidden="true" />
						</div>

						<div className="mt-5 grid grid-cols-3 gap-3">
							{images.map((image, index) => (
									<div key={`${image}-${index}`} className="overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
										<img src={image} alt={`${laverie.nom} ${index + 1}`} className="h-28 w-full object-cover sm:h-32 lg:h-36" loading="lazy" decoding="async" />
								</div>
							))}
						</div>
					</div>

						<div className="rounded-[28px] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="equipements-title">
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Équipements</p>
							<h2 id="equipements-title" className="mt-2 text-lg font-bold text-slate-900">Services et machines</h2>

						<div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
							{laverie.equipements.length > 0 ? laverie.equipements.map((equipement) => (
								<div key={equipement.id} className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4 shadow-sm">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
											<Weight className="h-5 w-5" aria-hidden="true" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-bold text-slate-900">{equipement.nom}</p>
											<p className="text-xs text-slate-500">{equipement.type}</p>
										</div>
									</div>
									<div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
										<div className="rounded-xl bg-white px-3 py-2">
											<p className="font-semibold text-slate-500">Capacité</p>
											<p className="mt-1 font-bold text-slate-900">{equipement.capacite} kg</p>
										</div>
										<div className="rounded-xl bg-white px-3 py-2">
											<p className="font-semibold text-slate-500">Prix</p>
											<p className="mt-1 font-bold text-slate-900">À partir de {equipement.tarif} €</p>
										</div>
										<div className="rounded-xl bg-white px-3 py-2">
											<p className="font-semibold text-slate-500">Cycle</p>
											<p className="mt-1 font-bold text-slate-900">{equipement.duree} min</p>
										</div>
										<div className="rounded-xl bg-white px-3 py-2">
											<p className="font-semibold text-slate-500">Réf.</p>
											<p className="mt-1 font-bold text-slate-900">{equipement.equipementReference ?? '—'}</p>
										</div>
									</div>
								</div>
							)) : (
								<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
									Équipements non renseignés pour cette fiche.
								</div>
							)}
						</div>

						<div className="mt-8">
							<h3 className="text-sm font-bold text-slate-900 mb-3">Autres services proposés</h3>
							<div className="flex flex-wrap gap-2">
								{laverie.services && laverie.services.length > 0 ? laverie.services.map((service) => (
									<Badge key={service.id} variant="secondary">{service.nom}</Badge>
								)) : (
									<span className="text-xs text-slate-500">Aucun service renseigné.</span>
								)}
							</div>
						</div>

						<div className="mt-6">
							<h3 className="text-sm font-bold text-slate-900 mb-3">Moyens de paiement acceptés</h3>
							<div className="flex flex-wrap gap-2">
								{laverie.paiements && laverie.paiements.length > 0 ? laverie.paiements.map((paiement) => (
									<Badge key={paiement.id} variant="outline" className="border-cyan-200 text-cyan-700 bg-cyan-50">{paiement.nom}</Badge>
								)) : (
									<span className="text-xs text-slate-500">Aucun moyen de paiement renseigné.</span>
								)}
							</div>
						</div>
					</div>
				</section>

				<section className="mt-8 rounded-[28px] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="avis-title">
					<div className="flex items-center justify-between gap-3">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Notes et avis</p>
							<h2 id="avis-title" className="mt-2 text-lg font-bold text-slate-900">Ce que disent les clients</h2>
						</div>
						<div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-sm font-semibold text-slate-900">
							<Star className="h-4 w-4 text-amber-500" aria-hidden="true" />
							{(laverie.noteMoyenne ?? 0).toFixed(1)} / 5
						</div>
					</div>

					<div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
						<div className="rounded-[24px] bg-cyan-50 p-5 text-center">
							<p className="text-sm font-medium text-slate-700">Quelle est votre note ?</p>
							<div className="mt-3 flex justify-center gap-1 text-3xl text-cyan-500">
								{Array.from({ length: 5 }).map((_, index) => (
									<Star key={index} className={`h-7 w-7 ${index < Math.round(laverie.noteMoyenne ?? 0) ? 'fill-current' : 'opacity-35'}`} aria-hidden="true" />
								))}
							</div>
							<AccessibleButton
								type="button"
								onClick={() => document.getElementById('avis-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
								className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-cyan-700 shadow-sm transition hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
								ariaLabel={`Laisser un commentaire sur ${laverie.nom}`}
							>
								Laisser un commentaire
							</AccessibleButton>
						</div>

						<div className="space-y-4">
							<div className="space-y-4" role="status" aria-live="polite">
								<div className="flex items-start justify-between gap-3 px-2">
									<div>
										<p className="text-sm font-semibold text-slate-900">Avis clients</p>
										<p className="mt-1 text-xs text-slate-500">{laverie.commentairesCount} commentaire{laverie.commentairesCount > 1 ? 's' : ''}</p>
									</div>
									<MessageSquare className="h-4 w-4 text-slate-400" aria-hidden="true" />
								</div>
								
								{laverie.commentaires && laverie.commentaires.length > 0 ? (
									<div className="space-y-3">
										{laverie.commentaires.map((commentaire) => (
											<div key={commentaire.id} className="rounded-2xl border border-slate-100 p-4 bg-white shadow-sm">
												<div className="flex justify-between items-start mb-2">
													<div>
														<p className="text-sm font-semibold text-slate-900">{commentaire.utilisateur.prenom} {commentaire.utilisateur.nom}</p>
														<p className="text-xs text-slate-500">{new Date(commentaire.date).toLocaleDateString('fr-FR')}</p>
													</div>
													<div className="flex gap-0.5 text-amber-500">
														{Array.from({ length: 5 }).map((_, index) => (
															<Star key={index} className={`h-3.5 w-3.5 ${index < commentaire.note ? 'fill-current' : 'text-slate-200'}`} aria-hidden="true" />
														))}
													</div>
												</div>
												<p className="text-sm text-slate-600 leading-relaxed">{commentaire.commentaire}</p>
											</div>
										))}
									</div>
								) : (
									<div className="rounded-2xl border border-slate-100 p-4">
										<p className="text-sm leading-6 text-slate-600">Aucun avis détaillé n'est encore disponible pour cette laverie.</p>
									</div>
								)}
							</div>


						</div>
					</div>
				</section>

				<div className="sticky bottom-4 mt-8 flex justify-center px-1 sm:px-0 lg:hidden">
					<a href={buildMapsLink(laverie)} target="_blank" rel="noreferrer" className="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500" aria-label={`Obtenir l'itinéraire vers ${laverie.nom}`}>
						<Navigation className="h-5 w-5" />
						Itinéraire
					</a>
				</div>
			</main>
		</div>
		</>
	);
}
