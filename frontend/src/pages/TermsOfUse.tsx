import { Link } from 'react-router';
import { ArrowLeft, FileText } from 'lucide-react';
import { SkipLink } from '../components/accessibility';

const sections = [
	{
		title: '1. Objet',
		content:
			"Les présentes conditions d'utilisation définissent les règles d'accès et d'utilisation de LaundryMap. En naviguant sur le site, vous acceptez ces conditions.",
	},
	{
		title: '2. Accès au service',
		content:
			"LaundryMap permet de rechercher des laveries, consulter leurs fiches et gérer certaines fonctionnalités selon votre profil. L'accès à certaines fonctionnalités peut nécessiter un compte.",
	},
	{
		title: '3. Compte utilisateur',
		content:
			"Vous êtes responsable des informations fournies lors de votre inscription et de la confidentialité de vos identifiants. Toute activité réalisée depuis votre compte est présumée effectuée par vous.",
	},
	{
		title: '4. Contenu du service',
		content:
			"Les informations affichées sur LaundryMap sont fournies à titre indicatif. Nous nous efforçons de maintenir les données à jour, sans garantir l'absence totale d'erreurs ou d'omissions.",
	},
	{
		title: '5. Comportement attendu',
		content:
			"Vous vous engagez à utiliser le service de manière loyale, à ne pas tenter d'altérer le fonctionnement du site et à ne pas publier de contenu illicite, abusif ou frauduleux.",
	},
	{
		title: '6. Données personnelles',
		content:
			"Le traitement des données personnelles est décrit dans notre politique de confidentialité. Nous utilisons les données uniquement pour fournir et améliorer le service.",
	},
	{
		title: '7. Responsabilité',
		content:
			"LaundryMap ne peut être tenu responsable des dommages indirects liés à l'utilisation du service, ni des indisponibilités temporaires dues à la maintenance ou à des événements extérieurs.",
	},
	{
		title: '8. Modification des conditions',
		content:
			"Nous pouvons mettre à jour ces conditions à tout moment. La version en vigueur est celle publiée sur cette page.",
	},
];

export default function TermsOfUse() {
	return (
		<div className="overflow-x-hidden bg-slate-50 px-5 pb-16 pt-16 sm:pt-20 lg:px-0 lg:pt-24">
			<SkipLink />

			<main id="main-content" role="main" tabIndex={-1} className="mx-auto max-w-[680px] min-w-0">

				<section className="overflow-hidden mt-4 rounded-[28px] bg-white shadow-sm">
					<div className="flex items-start gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
						<div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
							<FileText className="h-4.5 w-4.5" aria-hidden="true" />
						</div>
						<div className="min-w-0">
							<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">CGU</p>
							<h1 className="mt-1 break-words text-2xl font-bold text-slate-900">Conditions d'utilisation</h1>
						</div>
					</div>

					<div className="px-5 pb-5 pt-4 sm:px-6">
						<p className="break-words text-sm leading-6 text-slate-600">
							L'application LaundryMap a pour objet de fournir une plateforme de localisation de laveries automatiques et de services de blanchisserie.
							L'utilisation des services implique l'acceptation pleine et entière des présentes conditions générales.
						</p>
					</div>

					<div className="border-t border-slate-100 px-5 py-5 sm:px-6">
						<div className="space-y-6">
							{sections.map((section) => (
								<article key={section.title} className="space-y-2">
									<h2 className="break-words text-base font-bold text-slate-900">{section.title}</h2>
									<p className="break-words text-sm leading-6 text-slate-600">{section.content}</p>
								</article>
							))}

							<article className="space-y-2">
								<h2 className="break-words text-base font-bold text-slate-900">9. Droit applicable</h2>
								<p className="break-words text-sm leading-6 text-slate-600">
									Les présentes conditions sont régies par le droit français. En cas de litige, une solution amiable sera recherchée en priorité.
								</p>
							</article>

						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
