import { FileText } from 'lucide-react';
import { SkipLink } from '../components/accessibility';

const cguSections = [
	{
		title: "1. Objet de l'application",
		content:
			"L'application LaundryMap a pour objet de fournir une plateforme de localisation de laveries automatiques et de services de blanchisserie. L'utilisation des services implique l'acceptation pleine et entière des présentes conditions générales.",
	},
	{
		title: '2. Accès au service',
		content:
			"Le service est accessible gratuitement à tout utilisateur disposant d'un accès à internet. Tous les coûts afférents à l'accès au service, que ce soient les frais matériels, logiciels ou d'accès à internet sont exclusivement à la charge de l'utilisateur.",
		content2:
			"LaundryMap se réserve le droit de refuser l'accès au service, unilatéralement et sans notification préalable, à tout utilisateur ne respectant pas les présentes conditions d'utilisation.",
	},
	{
		title: '3. Propriété intellectuelle',
		content:
			"L'ensemble des éléments composant le service LaundryMap, notamment les textes, graphismes, logos, icônes, images et contenus, est protégé par les lois en vigueur relatives à la propriété intellectuelle.",
	},
	{
		title: '4. Responsabilité',
		content:
			"LaundryMap met tout en œuvre pour assurer l'exactitude des informations diffusées, sans toutefois pouvoir garantir l'absence totale d'erreurs ou d'omissions. L'éditeur ne saurait être tenu responsable des dommages directs ou indirects liés à l'utilisation du service.",
	},
];

export default function LegalNotice() {
	return (
		<div className="overflow-x-hidden mt-4 bg-slate-50 px-5 pb-16 pt-16 sm:pt-20 lg:px-0 lg:pt-24">
			<SkipLink />

			<main id="main-content" role="main" tabIndex={-1} className="mx-auto max-w-[680px] min-w-0">
				<section className="overflow-hidden rounded-[28px] bg-white shadow-sm">
					<div className="px-5 pt-5 sm:px-6 sm:pt-6">
						<div className="flex min-w-0 items-center gap-3">
							<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
								<FileText className="h-4.5 w-4.5" aria-hidden="true" />
							</div>
							<div className="min-w-0">
								<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">Mentions légales</p>
								<h1 className="mt-1 break-words text-2xl font-bold text-slate-900">Mentions Légales</h1>
							</div>
						</div>

						<p className="mt-5 break-words text-sm leading-6 text-slate-600">
							Conformément aux dispositions des articles 6–III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'économie numérique, dite L.C.E.N., nous portons à la connaissance des utilisateurs les informations suivantes :
						</p>
					</div>

					<div className="px-5 py-5 sm:px-6">
						<div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
							<p className="break-words text-sm leading-6 text-slate-700">
								<strong className="font-semibold text-slate-900">Éditeur :</strong> LaundryMap SARL<br />
								<strong className="font-semibold text-slate-900">Siège social :</strong> 127 Avenue des Champs-Élysées, 75008 Paris<br />
								<strong className="font-semibold text-slate-900">SIRET :</strong> 802 456 789 00012<br />
								<strong className="font-semibold text-slate-900">Contact :</strong> contact@laundrymap.com
							</p>
						</div>
					</div>

					<div className="border-t border-slate-100 px-5 pb-5 pt-2 sm:px-6">
						<div className="flex min-w-0 items-center gap-3">
							<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
								<FileText className="h-4.5 w-4.5" aria-hidden="true" />
							</div>
							<div className="min-w-0">
								<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">CGU</p>
								<h2 className="mt-1 break-words text-2xl font-bold text-slate-900">CGU</h2>
							</div>
						</div>

						<div className="mt-5 space-y-5">
							{cguSections.map((section) => (
								<article key={section.title} className="space-y-3">
									<h3 className="break-words text-base font-bold text-slate-900">{section.title}</h3>
									<p className="break-words text-sm leading-6 text-slate-600">{section.content}</p>
									{'content2' in section && section.content2 && (
										<p className="break-words text-sm leading-6 text-slate-600">{section.content2}</p>
									)}
								</article>
							))}
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
