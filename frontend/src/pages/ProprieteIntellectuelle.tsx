import { Shield } from 'lucide-react';
import { SkipLink } from '../components/accessibility';

const sections = [
	{
		content:
			"Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments de l'application, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de l'éditeur.",
	},
	{
		content:
			"La marque LaundryMap, ainsi que le logo associé, sont des signes protégés. Toute reproduction totale ou partielle de ces marques ou de ces logos effectuée à partir des éléments de l'application sans l'autorisation expresse de l'éditeur est donc prohibée.",
	},
	{
		content:
			"Toute exploitation non autorisée de l'application ou de l'un quelconque des éléments qu'elle contient sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.",
	},
];

export default function ProprieteIntellectuelle() {
	return (
		<div className="overflow-x-hidden bg-slate-50 px-5 pb-16 pt-16 sm:pt-20 lg:px-0 lg:pt-24">
			<SkipLink />

			<main id="main-content" role="main" tabIndex={-1} className="mx-auto max-w-[680px] min-w-0">
				<section className="overflow-hidden mt-4 rounded-[28px] bg-white shadow-sm">
					<div className="px-5 pt-5 pb-5 sm:px-6 sm:pt-6">
						<div className="flex min-w-0 items-center gap-3">
							<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
								<Shield className="h-4.5 w-4.5" aria-hidden="true" />
							</div>
							<div className="min-w-0">
								<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">Légal</p>
								<h1 className="mt-1 break-words text-2xl font-bold text-slate-900">Propriété intellectuelle</h1>
							</div>
						</div>

						<div className="mt-5 space-y-5">
							{sections.map((section) => (
								<p key={section.content} className="break-words text-sm leading-6 text-slate-600">
									{section.content}
								</p>
							))}
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}