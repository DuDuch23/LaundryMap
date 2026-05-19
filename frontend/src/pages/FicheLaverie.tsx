import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import {
	ArrowRight,
	Check,
	CheckCircle2,
	Clock3,
	Heart,
	LayoutGrid,
	MapPin,
	MessageSquare,
	Navigation,
	Pencil,
	Share2,
	Star,
	Trash2,
	Weight,
	X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AccessibleButton, SkipLink } from '../components/accessibility';
import API_BASE_URL, { uploadPath, resolveUrl } from '../services/api';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { fetchPublicLaverieDetail, ajouterFavori, supprimerFavori, creerAvis, modifierAvis, supprimerAvis, type LaveriePublicDetail, type MonAvis } from '../services/request';

const fallbackLaverieImage = uploadPath('/uploads/laveries/default-laundry.jpg');

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

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
	const [hovered, setHovered] = useState(0);
	return (
		<div className="flex gap-1.5" role="group" aria-label="Note sur 5">
			{[1, 2, 3, 4, 5].map((star) => (
				<button
					key={star}
					type="button"
					onClick={() => onChange(star)}
					onMouseEnter={() => setHovered(star)}
					onMouseLeave={() => setHovered(0)}
					aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
					className="transition-transform hover:scale-110 focus-visible:outline-none"
				>
					<Star className={`h-7 w-7 transition-colors ${star <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
				</button>
			))}
		</div>
	);
}

export default function FicheLaverie() {
	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const [laverie, setLaverie] = useState<LaveriePublicDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [shareFeedback, setShareFeedback] = useState<string | null>(null);
	const [isFavorite, setIsFavorite] = useState(false);
	const [favoritePending, setFavoritePending] = useState(false);

	// ── Avis ─────────────────────────────────────────────────────────────────
	const [monAvis, setMonAvis] = useState<MonAvis | null>(null);
	const [avisFormNote, setAvisFormNote] = useState(0);
	const [avisFormCommentaire, setAvisFormCommentaire] = useState('');
	const [avisFormStep, setAvisFormStep] = useState<'note' | 'commentaire'>('note');
	const [avisFormVisible, setAvisFormVisible] = useState(false);
	const [avisEditing, setAvisEditing] = useState(false);
	const [avisConfirmDelete, setAvisConfirmDelete] = useState(false);
	const [avisPending, setAvisPending] = useState(false);

	// ── Édition inline du commentaire propre dans la liste ───────────────────
	const [commentEditing, setCommentEditing] = useState(false);
	const [commentStep, setCommentStep] = useState<'note' | 'commentaire'>('note');
	const [commentEditNote, setCommentEditNote] = useState(0);
	const [commentEditText, setCommentEditText] = useState('');
	const [commentConfirmDelete, setCommentConfirmDelete] = useState(false);
	const [commentPending, setCommentPending] = useState(false);

	const isProfessionnel = useMemo(() => {
		const token = localStorage.getItem('token');
		if (!token) return false;
		try {
			const base64Url = token.split('.')[1];
			const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			const jsonPayload = decodeURIComponent(
				window.atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
			);
			const roles = JSON.parse(jsonPayload).roles || [];
			return roles.some((r: string) => r.includes('PROFESSIONNEL'));
		} catch (e) {
			return false;
		}
	}, []);

	useEffect(() => {
		let active = true;

		const fetchLaverie = async () => {
			try {
				setLoading(true);
				setError(null);

				if (!id) {
					throw new Error('Identifiant de laverie manquant.');
				}

				const data = await fetchPublicLaverieDetail(id);

				if (!active) {
					return;
				}

				setLaverie(data);
				if (data.monAvis) {
					setMonAvis(data.monAvis);
					setAvisFormNote(data.monAvis.note);
					setAvisFormCommentaire(data.monAvis.commentaire ?? '');
				}

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
					setError(err?.message || 'Impossible de charger la fiche de la laverie.');
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

	const isStandardUser = useMemo(() => {
		const token = localStorage.getItem('token');
		if (!token) return false;
		try {
			const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
			const roles: string[] = payload.roles ?? [];
			return !roles.some((r) => r.includes('PROFESSIONNEL') || r.includes('ADMIN'));
		} catch { return false; }
	}, []);

	const openAvisForm = () => {
		setAvisFormNote(monAvis?.note ?? 0);
		setAvisFormCommentaire(monAvis?.commentaire ?? '');
		setAvisFormStep('note');
		if (monAvis) {
			setAvisEditing(true);
		} else {
			setAvisFormVisible(true);
		}
	};

	const closeAvisForm = () => {
		setAvisFormVisible(false);
		setAvisEditing(false);
		setAvisFormStep('note');
		setAvisFormNote(monAvis?.note ?? 0);
		setAvisFormCommentaire(monAvis?.commentaire ?? '');
	};

	const handleAvisNext = () => {
		if (avisFormNote < 1) {
			toast.error(t('main.fiche_laverie.avis.toast_note_requise'));
			return;
		}
		setAvisFormStep('commentaire');
	};

	const handleSubmitAvis = async () => {
		if (!laverie || avisFormNote < 1) { toast.error(t('main.fiche_laverie.avis.toast_note_requise')); return; }
		setAvisPending(true);
		try {
			const trimmed = avisFormCommentaire.trim();
			const commentairePayload = trimmed === '' ? null : trimmed;

			if (monAvis) {
				const updated = await modifierAvis(monAvis.id, avisFormNote, commentairePayload);
				setMonAvis(updated);
				setAvisEditing(false);
				setAvisFormStep('note');

				// Synchroniser la liste publique
				setLaverie((prev) => {
					if (!prev) return prev;
					const previous = prev.commentaires.find((c) => c.id === updated.id);
					const without = prev.commentaires.filter((c) => c.id !== updated.id);
					const hadCommentBefore = !!previous;
					const hasCommentNow = !!(updated.commentaire && updated.commentaire.trim() !== '');
					let next = without;
					if (hasCommentNow) {
						const dateIso = updated.commenteLe ?? updated.noteLe ?? new Date().toISOString();
						next = [{
							id: updated.id,
							note: updated.note,
							commentaire: updated.commentaire as string,
							date: dateIso,
							utilisateur: previous?.utilisateur ?? { prenom: '', nom: '' },
						}, ...without];
					}
					const delta = (hasCommentNow ? 1 : 0) - (hadCommentBefore ? 1 : 0);
					return { ...prev, commentaires: next, commentairesCount: Math.max(0, prev.commentairesCount + delta) };
				});

				toast.success(t('main.fiche_laverie.avis.toast_avis_modifie'));
			} else {
				const created = await creerAvis(laverie.id, avisFormNote, commentairePayload);
				setMonAvis(created);
				setAvisFormVisible(false);
				setAvisFormStep('note');
				setAvisFormCommentaire('');

				// Ajouter à la liste publique si commentaire renseigné
				if (created.commentaire && created.commentaire.trim() !== '') {
					setLaverie((prev) => {
						if (!prev) return prev;
						const dateIso = created.commenteLe ?? created.noteLe ?? new Date().toISOString();
						const ownEntry = {
							id: created.id,
							note: created.note,
							commentaire: created.commentaire as string,
							date: dateIso,
							utilisateur: { prenom: 'Mon', nom: 'avis' },
						};
						return {
							...prev,
							commentaires: [ownEntry, ...prev.commentaires],
							commentairesCount: prev.commentairesCount + 1,
						};
					});
				}

				toast.success(t('main.fiche_laverie.avis.toast_avis_publie'));
			}
		} catch (err: any) {
			toast.error(err?.message || t('main.fiche_laverie.avis.toast_erreur'));
		} finally {
			setAvisPending(false);
		}
	};

	const handleDeleteAvis = async () => {
		if (!monAvis) return;
		setAvisPending(true);
		try {
			await supprimerAvis(monAvis.id);
			setMonAvis(null);
			setAvisFormNote(0);
			setAvisConfirmDelete(false);
			setAvisEditing(false);
			// Retirer de la liste publique des commentaires
			setLaverie((prev) => prev ? { ...prev, commentaires: prev.commentaires.filter((c) => c.id !== monAvis.id), commentairesCount: Math.max(0, prev.commentairesCount - (monAvis.commentaire ? 1 : 0)) } : prev);
			toast.success(t('main.fiche_laverie.avis.toast_avis_supprime'));
		} catch (err: any) {
			toast.error(err?.message || t('main.fiche_laverie.avis.toast_erreur'));
		} finally {
			setAvisPending(false);
		}
	};

	// ── Modification inline du commentaire dans la liste ─────────────────────
	const startInlineEdit = () => {
		if (!monAvis) return;
		setCommentEditNote(monAvis.note);
		setCommentEditText(monAvis.commentaire ?? '');
		setCommentStep('note');
		setCommentConfirmDelete(false);
		setCommentEditing(true);
	};

	const handleCommentCancel = () => {
		setCommentEditing(false);
		setCommentConfirmDelete(false);
		setCommentStep('note');
	};

	const handleCommentNext = () => {
		if (commentEditNote < 1) {
			toast.error(t('main.fiche_laverie.avis.toast_note_requise'));
			return;
		}
		setCommentStep('commentaire');
	};

	const handleCommentSave = async () => {
		if (!monAvis || commentEditNote < 1) {
			toast.error(t('main.fiche_laverie.avis.toast_note_requise'));
			return;
		}
		setCommentPending(true);
		try {
			const trimmed = commentEditText.trim();
			const updated = await modifierAvis(monAvis.id, commentEditNote, trimmed === '' ? null : trimmed);
			setMonAvis(updated);
			setAvisFormNote(updated.note);
			setCommentEditing(false);
			setCommentStep('note');

			// Mettre à jour la liste publique : ajouter/modifier/retirer selon le commentaire
			setLaverie((prev) => {
				if (!prev) return prev;
				const dateIso = updated.commenteLe ?? updated.noteLe ?? new Date().toISOString();
				const without = prev.commentaires.filter((c) => c.id !== updated.id);
				let next = without;
				if (updated.commentaire && updated.commentaire.trim() !== '') {
					// On réutilise les infos d'auteur déjà présentes dans la liste si dispo
					const previous = prev.commentaires.find((c) => c.id === updated.id);
					const own = {
						id: updated.id,
						note: updated.note,
						commentaire: updated.commentaire,
						date: dateIso,
						utilisateur: previous?.utilisateur ?? { prenom: '', nom: '' },
					};
					next = [own, ...without];
				}
				// Recalcule du compteur
				const count = next.length + (prev.commentairesCount - prev.commentaires.length);
				return { ...prev, commentaires: next, commentairesCount: Math.max(count, next.length) };
			});

			toast.success(t('main.fiche_laverie.avis.toast_avis_modifie'));
		} catch (err: any) {
			toast.error(err?.message || t('main.fiche_laverie.avis.toast_erreur'));
		} finally {
			setCommentPending(false);
		}
	};

	const handleCommentDelete = async () => {
		if (!monAvis) return;
		setCommentPending(true);
		try {
			await supprimerAvis(monAvis.id);
			const deletedId = monAvis.id;
			const hadCommentaire = !!monAvis.commentaire;
			setMonAvis(null);
			setAvisFormNote(0);
			setCommentEditing(false);
			setCommentConfirmDelete(false);
			setLaverie((prev) => prev ? {
				...prev,
				commentaires: prev.commentaires.filter((c) => c.id !== deletedId),
				commentairesCount: Math.max(0, prev.commentairesCount - (hadCommentaire ? 1 : 0)),
			} : prev);
			toast.success(t('main.fiche_laverie.avis.toast_avis_supprime'));
		} catch (err: any) {
			toast.error(err?.message || t('main.fiche_laverie.avis.toast_erreur'));
		} finally {
			setCommentPending(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-slate-50 px-5 pb-16 pt-20 lg:px-0">
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
		return (
			<div className="min-h-screen w-full bg-slate-50 px-5 pt-20 lg:px-0">
				<div className="mx-auto max-w-[1280px] rounded-2xl bg-rose-100 px-4 py-3 text-rose-700" role="alert" aria-live="assertive">
					{error}
				</div>
			</div>
		);
	}

	if (!laverie) {
		return (
			<div className="min-h-screen w-full bg-slate-50 px-5 pt-20 lg:px-0">
				<div className="mx-auto max-w-[1280px] rounded-[28px] bg-white p-8 text-center shadow-sm">
					<p className="text-base font-semibold text-slate-900">Laverie introuvable.</p>
					<p className="mt-2 text-sm text-slate-500">Cette fiche n’est plus disponible.</p>
				</div>
			</div>
		);
	}

	return (
		<>
		<div className="bg-slate-50 px-5 pb-16 pt-16 sm:pt-20 lg:px-0 lg:pt-24">
			<SkipLink />
			<main id="main-content" role="main" tabIndex={-1} className="mx-auto max-w-[1280px]">
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
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('main.fiche_laverie.avis.section_kicker')}</p>
							<h2 id="avis-title" className="mt-2 text-lg font-bold text-slate-900">{t('main.fiche_laverie.avis.section_titre')}</h2>
						</div>
						<div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-sm font-semibold text-slate-900">
							<Star className="h-4 w-4 text-amber-500" aria-hidden="true" />
							{(laverie.noteMoyenne ?? 0).toFixed(1)} / 5
						</div>
					</div>

					<div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
						{/* Panneau gauche : note moyenne + formulaire */}
						<div className="rounded-[24px] bg-cyan-50 p-5">
							<p className="text-center text-sm font-medium text-slate-700">{t('main.fiche_laverie.avis.note_moyenne')}</p>
							<div className="mt-3 flex justify-center gap-1">
								{Array.from({ length: 5 }, (_, i) => (
									<Star key={i} className={`h-7 w-7 ${i < Math.round(laverie.noteMoyenne ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} aria-hidden="true" />
								))}
							</div>

							{isStandardUser && !monAvis && !avisFormVisible && (
								<button
									type="button"
									onClick={openAvisForm}
									className="mt-4 w-full rounded-full bg-white py-2 text-sm font-semibold text-cyan-700 shadow-sm transition hover:bg-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 cursor-pointer"
								>
									{t('main.fiche_laverie.avis.bouton_laisser_avis')}
								</button>
							)}

							{isStandardUser && (avisFormVisible || monAvis) && (
								<div className="mt-4 space-y-3">
									{monAvis && !avisEditing ? (
										<>
											<p className="text-xs font-semibold text-slate-500 text-center">{t('main.fiche_laverie.avis.votre_avis_badge')}</p>
											<div className="flex justify-center gap-1">
												{Array.from({ length: 5 }, (_, i) => (
													<Star key={i} className={`h-5 w-5 ${i < monAvis.note ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
												))}
											</div>
											{avisConfirmDelete ? (
												<div className="space-y-2">
													<p className="text-xs font-medium text-rose-700 text-center">{t('main.fiche_laverie.avis.confirmer_suppression_court')}</p>
													<div className="flex gap-2 justify-center">
														<button type="button" onClick={handleDeleteAvis} disabled={avisPending}
															className="flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600 disabled:opacity-60 transition-colors">
															<Trash2 className="h-3 w-3" /> {t('main.fiche_laverie.avis.bouton_supprimer')}
														</button>
														<button type="button" onClick={() => setAvisConfirmDelete(false)}
															className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
															<X className="h-3 w-3" /> {t('main.fiche_laverie.avis.bouton_annuler')}
														</button>
													</div>
												</div>
											) : (
												<div className="flex gap-2 justify-center">
													<button type="button" onClick={openAvisForm}
														className="flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
														<Pencil className="h-3 w-3" /> {t('main.fiche_laverie.avis.bouton_modifier')}
													</button>
													<button type="button" onClick={() => setAvisConfirmDelete(true)}
														className="flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
														<Trash2 className="h-3 w-3" /> {t('main.fiche_laverie.avis.bouton_supprimer')}
													</button>
												</div>
											)}
										</>
									) : (
										<>
											<div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
												<span className={avisFormStep === 'note' ? 'text-[#14A8DE]' : ''}>{t('main.fiche_laverie.avis.etape_note')}</span>
												<span className="text-slate-300">/</span>
												<span className={avisFormStep === 'commentaire' ? 'text-[#14A8DE]' : ''}>{t('main.fiche_laverie.avis.etape_commentaire')}</span>
											</div>

											{avisFormStep === 'note' ? (
												<>
													<p className="text-xs font-semibold text-slate-500 text-center">{monAvis ? t('main.fiche_laverie.avis.modifier_votre_note') : t('main.fiche_laverie.avis.votre_note')}</p>
													<div className="flex justify-center">
														<StarPicker value={avisFormNote} onChange={setAvisFormNote} />
													</div>
													<div className="flex flex-wrap gap-2 justify-center">
														<button type="button" onClick={handleAvisNext} disabled={avisPending || avisFormNote < 1}
															className="flex items-center gap-1.5 rounded-lg bg-[#14A8DE] px-4 py-2 text-xs font-semibold text-white hover:bg-[#119ac8] disabled:opacity-60 transition-colors cursor-pointer">
															{t('main.fiche_laverie.avis.bouton_suivant')} <ArrowRight className="h-3.5 w-3.5" />
														</button>
														<button type="button" onClick={closeAvisForm}
															className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
															<X className="h-3 w-3" /> {t('main.fiche_laverie.avis.bouton_annuler')}
														</button>
													</div>
												</>
											) : (
												<>
													<label htmlFor="avis-form-commentaire" className="block text-xs font-semibold text-slate-500 text-center">
														{t('main.fiche_laverie.avis.label_commentaire')} <span className="text-slate-400 font-normal normal-case">{t('main.fiche_laverie.avis.label_facultatif')}</span>
													</label>
													<div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-[#14A8DE] focus-within:ring-2 focus-within:ring-[#14A8DE]/20 transition-colors">
														<textarea
															id="avis-form-commentaire"
															rows={4}
															maxLength={1000}
															value={avisFormCommentaire}
															onChange={(e) => setAvisFormCommentaire(e.target.value)}
															placeholder={t('main.fiche_laverie.avis.placeholder_commentaire') as string}
															className="block w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none border-0 p-0"
														/>
													</div>
													<p className="text-right text-[11px] text-slate-400">{avisFormCommentaire.length}/1000</p>
													<div className="flex flex-wrap gap-2 justify-center">
														<button type="button" onClick={handleSubmitAvis} disabled={avisPending || avisFormNote < 1}
															className="flex items-center gap-1.5 rounded-lg bg-[#14A8DE] px-4 py-2 text-xs font-semibold text-white hover:bg-[#119ac8] disabled:opacity-60 transition-colors cursor-pointer">
															<Check className="h-3.5 w-3.5" /> {monAvis ? t('main.fiche_laverie.avis.bouton_enregistrer') : t('main.fiche_laverie.avis.bouton_publier')}
														</button>
														<button type="button" onClick={() => setAvisFormStep('note')} disabled={avisPending}
															className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
															{t('main.fiche_laverie.avis.bouton_retour')}
														</button>
														<button type="button" onClick={closeAvisForm}
															className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
															<X className="h-3 w-3" /> {t('main.fiche_laverie.avis.bouton_annuler')}
														</button>
													</div>
												</>
											)}
										</>
									)}
								</div>
							)}
						</div>

						<div className="space-y-4">
							<div className="space-y-4" role="status" aria-live="polite">
								<div className="flex items-start justify-between gap-3 px-2">
									<div>
										<p className="text-sm font-semibold text-slate-900">{t('main.fiche_laverie.avis.liste_titre')}</p>
										<p className="mt-1 text-xs text-slate-500">{t('main.fiche_laverie.avis.liste_compteur', { count: laverie.commentairesCount })}</p>
									</div>
									<MessageSquare className="h-4 w-4 text-slate-400" aria-hidden="true" />
								</div>
								
								{laverie.commentaires && laverie.commentaires.length > 0 ? (
									<div className="space-y-3">
										{laverie.commentaires.map((commentaire) => {
											const isMine = isStandardUser && monAvis !== null && commentaire.id === monAvis.id;
											const showInlineEdit = isMine && commentEditing;
											const showConfirmDelete = isMine && commentConfirmDelete;

											return (
												<div key={commentaire.id} className={`rounded-2xl border p-4 bg-white shadow-sm ${isMine ? 'border-cyan-200 ring-1 ring-cyan-100' : 'border-slate-100'}`}>
													<div className="flex justify-between items-start mb-2 gap-3">
														<div className="min-w-0">
															<p className="text-sm font-semibold text-slate-900">
																{commentaire.utilisateur.prenom} {commentaire.utilisateur.nom}
																{isMine && <span className="ml-2 inline-block rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-700">{t('main.fiche_laverie.avis.votre_avis_badge')}</span>}
															</p>
															<p className="text-xs text-slate-500">{commentaire.date ? new Date(commentaire.date).toLocaleDateString('fr-FR') : ''}</p>
														</div>
														<div className="flex items-center gap-2 shrink-0">
															<div className="flex gap-0.5 text-amber-500">
																{Array.from({ length: 5 }).map((_, index) => (
																	<Star key={index} className={`h-3.5 w-3.5 ${index < commentaire.note ? 'fill-current' : 'text-slate-200'}`} aria-hidden="true" />
																))}
															</div>
															{isMine && !commentEditing && !commentConfirmDelete && (
																<div className="flex gap-1.5 ml-1">
																	<button
																		type="button"
																		onClick={startInlineEdit}
																		className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-[#14A8DE] hover:text-white transition-colors cursor-pointer"
																		aria-label={t('main.fiche_laverie.avis.modifier_aria') as string}
																	>
																		<Pencil className="h-3.5 w-3.5" />
																	</button>
																	<button
																		type="button"
																		onClick={() => setCommentConfirmDelete(true)}
																		className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
																		aria-label={t('main.fiche_laverie.avis.supprimer_aria') as string}
																	>
																		<Trash2 className="h-3.5 w-3.5" />
																	</button>
																</div>
															)}
														</div>
													</div>

													{showConfirmDelete ? (
														<div className="mt-3 rounded-xl bg-rose-50 border border-rose-200 p-3">
															<p className="text-sm font-medium text-rose-800">{t('main.fiche_laverie.avis.confirmer_suppression_long')}</p>
															<div className="mt-2 flex gap-2">
																<button
																	type="button"
																	onClick={handleCommentDelete}
																	disabled={commentPending}
																	className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600 disabled:opacity-60 transition-colors cursor-pointer"
																>
																	<Trash2 className="h-3.5 w-3.5" />
																	{t('main.fiche_laverie.avis.bouton_supprimer')}
																</button>
																<button
																	type="button"
																	onClick={() => setCommentConfirmDelete(false)}
																	className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
																>
																	<X className="h-3.5 w-3.5" />
																	{t('main.fiche_laverie.avis.bouton_annuler')}
																</button>
															</div>
														</div>
													) : showInlineEdit ? (
														<div className="mt-3 space-y-3">
															<div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
																<span className={commentStep === 'note' ? 'text-[#14A8DE]' : ''}>{t('main.fiche_laverie.avis.etape_note')}</span>
																<span className="text-slate-300">/</span>
																<span className={commentStep === 'commentaire' ? 'text-[#14A8DE]' : ''}>{t('main.fiche_laverie.avis.etape_commentaire')}</span>
															</div>

															{commentStep === 'note' ? (
																<>
																	<StarPicker value={commentEditNote} onChange={setCommentEditNote} />
																	<div className="flex flex-wrap gap-2">
																		<button
																			type="button"
																			onClick={handleCommentNext}
																			disabled={commentPending}
																			className="flex items-center gap-1.5 rounded-lg bg-[#14A8DE] px-4 py-2 text-xs font-semibold text-white hover:bg-[#119ac8] disabled:opacity-60 transition-colors cursor-pointer"
																		>
																			{t('main.fiche_laverie.avis.bouton_suivant')}
																			<ArrowRight className="h-3.5 w-3.5" />
																		</button>
																		<button
																			type="button"
																			onClick={handleCommentCancel}
																			className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
																		>
																			<X className="h-3.5 w-3.5" />
																			{t('main.fiche_laverie.avis.bouton_annuler')}
																		</button>
																	</div>
																</>
															) : (
																<>
																	<label htmlFor={`commentaire-fiche-${commentaire.id}`} className="block text-sm font-medium text-slate-700">
																		{t('main.fiche_laverie.avis.label_commentaire')} <span className="text-slate-400 font-normal">{t('main.fiche_laverie.avis.label_facultatif')}</span>
																	</label>
																	<div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-[#14A8DE] focus-within:ring-2 focus-within:ring-[#14A8DE]/20 transition-colors">
																		<textarea
																			id={`commentaire-fiche-${commentaire.id}`}
																			rows={4}
																			maxLength={1000}
																			value={commentEditText}
																			onChange={(e) => setCommentEditText(e.target.value)}
																			placeholder={t('main.fiche_laverie.avis.placeholder_commentaire') as string}
																			className="block w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none border-0 p-0"
																		/>
																	</div>
																	<p className="text-right text-[11px] text-slate-400">{commentEditText.length}/1000</p>
																	<div className="flex flex-wrap gap-2">
																		<button
																			type="button"
																			onClick={handleCommentSave}
																			disabled={commentPending}
																			className="flex items-center gap-1.5 rounded-lg bg-[#14A8DE] px-4 py-2 text-xs font-semibold text-white hover:bg-[#119ac8] disabled:opacity-60 transition-colors cursor-pointer"
																		>
																			<Check className="h-3.5 w-3.5" />
																			{t('main.fiche_laverie.avis.bouton_enregistrer')}
																		</button>
																		<button
																			type="button"
																			onClick={() => setCommentStep('note')}
																			disabled={commentPending}
																			className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
																		>
																			{t('main.fiche_laverie.avis.bouton_retour')}
																		</button>
																		<button
																			type="button"
																			onClick={handleCommentCancel}
																			className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
																		>
																			<X className="h-3.5 w-3.5" />
																			{t('main.fiche_laverie.avis.bouton_annuler')}
																		</button>
																	</div>
																</>
															)}
														</div>
													) : (
														<p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line break-words">{commentaire.commentaire}</p>
													)}
												</div>
											);
										})}
									</div>
								) : (
									<div className="rounded-2xl border border-slate-100 p-4">
										<p className="text-sm leading-6 text-slate-600">{t('main.fiche_laverie.avis.liste_vide')}</p>
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
