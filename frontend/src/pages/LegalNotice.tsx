import { Building2, Clock, FileText, Globe, Lock, Server, Shield, UserCheck } from 'lucide-react';
import { SkipLink } from '../components/accessibility';

function Section({ id, icon: Icon, badge, title, children }: {
    id: string;
    icon: React.ElementType;
    badge: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section id={id} className="border-t border-slate-100 px-5 pb-6 pt-5 sm:px-6">
            <div className="flex min-w-0 items-center gap-3 mb-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                    <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">{badge}</p>
                    <h2 className="mt-0.5 break-words text-lg font-bold text-slate-900">{title}</h2>
                </div>
            </div>
            {children}
        </section>
    );
}

function Para({ children }: { children: React.ReactNode }) {
    return <p className="break-words text-sm leading-6 text-slate-600">{children}</p>;
}

function InfoBox({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5 text-sm leading-6 text-slate-700">
            {children}
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <p>
            <strong className="font-semibold text-slate-900">{label} : </strong>
            {value}
        </p>
    );
}

export default function LegalNotice() {
    return (
        <div className="overflow-x-hidden mt-4 bg-slate-50 px-5 pb-16 pt-16 sm:pt-20 lg:px-0 lg:pt-24">
            <SkipLink />

            <main id="main-content" role="main" tabIndex={-1} className="mx-auto max-w-[680px] min-w-0">
                <article className="overflow-hidden rounded-[28px] bg-white shadow-sm">

                    {/* ── En-tête ── */}
                    <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                                <FileText className="h-4.5 w-4.5" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">Légal</p>
                                <h1 className="mt-0.5 break-words text-2xl font-bold text-slate-900">Mentions légales</h1>
                            </div>
                        </div>
                        <p className="mt-4 break-words text-sm leading-6 text-slate-600">
                            Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004
                            pour la Confiance dans l'économie numérique (L.C.E.N.), nous portons à la connaissance des
                            utilisateurs les informations suivantes :
                        </p>
                    </div>

                    {/* ── 1. Éditeur ── */}
                    <Section id="editeur" icon={Building2} badge="Identité" title="Éditeur du site">
                        <InfoBox>
                            <Row label="Éditeur" value="LaundryMap" />
                            <Row label="Forme juridique" value="Projet académique — Groupe 4, Lycée Saint-Vincent" />
                            <Row label="Contact" value="contact@laundrymap.com" />
                            <Row label="Directeur de publication" value="Équipe LaundryMap" />
                        </InfoBox>
                    </Section>

                    {/* ── 2. Hébergement ── */}
                    <Section id="hebergement" icon={Server} badge="Infrastructure" title="Hébergement">
                        <InfoBox>
                            <Row label="Hébergeur" value="À compléter (ex : OVH SAS, 2 rue Kellermann, 59100 Roubaix)" />
                            <Row label="Site" value="www.ovh.com" />
                        </InfoBox>
                        <p className="mt-3 break-words text-xs leading-5 text-slate-400">
                            Veuillez indiquer les coordonnées réelles de votre hébergeur conformément à l'article 6 de la LCEN.
                        </p>
                    </Section>

                    {/* ── 3. Propriété intellectuelle ── */}
                    <Section id="propriete-intellectuelle" icon={Shield} badge="Droits" title="Propriété intellectuelle">
                        <div className="space-y-3">
                            <Para>
                                L'ensemble des éléments composant LaundryMap — textes, graphismes, logos, icônes, images
                                et contenus — est protégé par les lois en vigueur relatives à la propriété intellectuelle.
                            </Para>
                            <Para>
                                Toute reproduction, représentation, modification, publication ou adaptation de tout ou
                                partie de ces éléments, quel que soit le moyen ou le procédé utilisé, est interdite sauf
                                autorisation écrite préalable de l'éditeur.
                            </Para>
                            <Para>
                                La marque LaundryMap ainsi que son logo sont des signes protégés. Toute reproduction
                                partielle ou totale sans autorisation expresse est donc prohibée.
                            </Para>
                            <Para>
                                Toute exploitation non autorisée sera considérée comme constitutive d'une contrefaçon et
                                poursuivie conformément aux articles L.335-2 et suivants du Code de la Propriété
                                Intellectuelle.
                            </Para>
                        </div>
                    </Section>

                    {/* ── 4. Conservation des données ── */}
                    <Section id="donnees-personnelles" icon={Lock} badge="RGPD" title="Conservation des données personnelles">
                        <div className="space-y-3">
                            <Para>
                                LaundryMap collecte uniquement les données nécessaires au fonctionnement du service :
                                adresse e-mail, nom, prénom, et données de localisation si l'utilisateur y consent
                                explicitement.
                            </Para>
                            <Para>
                                Les données sont hébergées sur des serveurs situés en Europe et ne sont transmises à
                                aucun tiers à des fins commerciales.
                            </Para>
                        </div>

                        <h3 className="mt-5 mb-3 text-sm font-bold text-slate-800">Durée de conservation</h3>
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Donnée</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Durée</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[
                                        ['Compte actif (nom, prénom, email)', 'Jusqu\'à la suppression du compte'],
                                        ['Après suppression du compte', 'Données anonymisées immédiatement (nom, prénom, email effacés)'],
                                        ['Commentaires & notes', 'Conservés anonymisés indéfiniment (intégrité de la plateforme)'],
                                        ['Token JWT (authentification)', 'Durée de la session navigateur'],
                                        ['Préférence de langue (localStorage)', 'Jusqu\'à effacement du cache navigateur'],
                                    ].map(([donnee, duree]) => (
                                        <tr key={donnee}>
                                            <td className="px-4 py-2.5 text-slate-700 font-medium">{donnee}</td>
                                            <td className="px-4 py-2.5 text-slate-500">{duree}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    {/* ── 5. Accessibilité ── */}
                    <Section id="accessibilite" icon={Globe} badge="Accessibilité" title="Accessibilité & éco-conception">
                        <div className="space-y-3">
                            <Para>
                                LaundryMap s'engage à rendre son application accessible au plus grand nombre. Voici les
                                mesures mises en place :
                            </Para>
                        </div>

                        <ul className="mt-3 space-y-2">
                            {[
                                ['Langue', 'Interface disponible en français et en anglais, détection automatique de la langue navigateur.'],
                                ['Navigation clavier', 'L\'ensemble du site est navigable à la tabulation (touches Tab / Shift+Tab / Entrée). Des liens d\'évitement sont présents.'],
                                ['Thème', 'L\'application respecte le thème système de l\'appareil (clair / sombre via prefers-color-scheme).'],
                                ['Textes alternatifs', 'Les images et icônes disposent d\'attributs alt ou aria-label pour les lecteurs d\'écran.'],
                                ['Score d\'accessibilité', 'Évaluation en cours — cible ≥ 90/100 sur Lighthouse.'],
                            ].map(([label, desc]) => (
                                <li key={label} className="flex gap-3 text-sm text-slate-600">
                                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400" aria-hidden="true" />
                                    <span><strong className="text-slate-800">{label} — </strong>{desc}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-800 mb-1">Éco-conception</p>
                            <p className="text-sm text-slate-600">
                                L'empreinte carbone du site a été mesurée sur{' '}
                                <a
                                    href="https://www.websitecarbon.com/website/groupe-4-lycee-stvincent-net/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-600 underline hover:text-cyan-800 transition-colors"
                                >
                                    Website Carbon Calculator
                                </a>
                                . Nous cherchons à minimiser les requêtes inutiles, à optimiser les images et à limiter
                                les dépendances tierces.
                            </p>
                        </div>
                    </Section>

                    {/* ── 6. Vos droits ── */}
                    <Section id="vos-droits" icon={UserCheck} badge="RGPD" title="Vos droits">
                        <Para>
                            Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
                            Informatique et Libertés, vous disposez des droits suivants concernant vos données
                            personnelles :
                        </Para>

                        <ul className="mt-4 space-y-2">
                            {[
                                ['Droit d\'accès', 'Consulter les données que nous détenons sur vous depuis votre profil.'],
                                ['Droit de rectification', 'Corriger vos informations directement dans votre espace profil.'],
                                ['Droit à l\'effacement', 'Supprimer votre compte et vos données depuis les paramètres du profil. Les données sont anonymisées immédiatement.'],
                                ['Droit à la portabilité', 'Obtenir une copie de vos données dans un format lisible — contactez-nous.'],
                                ['Droit d\'opposition', 'Vous opposer à certains traitements en nous contactant.'],
                                ['Droit de retrait du consentement', 'Révoquer vos préférences cookies à tout moment via le lien en bas de page.'],
                            ].map(([label, desc]) => (
                                <li key={label} className="flex gap-3 text-sm text-slate-600">
                                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400" aria-hidden="true" />
                                    <span><strong className="text-slate-800">{label} — </strong>{desc}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-slate-600">
                            <strong className="text-slate-800">Pour exercer vos droits : </strong>
                            contactez-nous à{' '}
                            <a href="mailto:contact@laundrymap.com" className="text-cyan-700 underline hover:text-cyan-900">
                                contact@laundrymap.com
                            </a>
                            . En cas de réclamation non résolue, vous pouvez saisir la{' '}
                            <a
                                href="https://www.cnil.fr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-700 underline hover:text-cyan-900"
                            >
                                CNIL
                            </a>
                            .
                        </div>
                    </Section>

                    {/* ── 7. Cookies ── */}
                    <Section id="cookies" icon={Clock} badge="Traceurs" title="Cookies & données de navigation">
                        <div className="space-y-3">
                            <Para>
                                LaundryMap n'utilise pas de cookies publicitaires ni de traceurs tiers à des fins
                                commerciales. Les seules données stockées localement sont :
                            </Para>
                        </div>

                        <ul className="mt-3 space-y-2">
                            {[
                                ['Token JWT (localStorage)', 'Nécessaire — maintient votre session de connexion. Supprimé à la déconnexion.'],
                                ['Langue (localStorage)', 'Préférence — mémorise votre langue d\'interface (fr/en). Modifiable à tout moment.'],
                                ['Tuiles cartographiques (OpenStreetMap)', 'Contenu tiers — le chargement des cartes implique des requêtes vers tile.openstreetmap.org (votre adresse IP est transmise à OSM conformément à leur politique de confidentialité).'],
                            ].map(([label, desc]) => (
                                <li key={label} className="flex gap-3 text-sm text-slate-600">
                                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400" aria-hidden="true" />
                                    <span><strong className="text-slate-800">{label} — </strong>{desc}</span>
                                </li>
                            ))}
                        </ul>

                        <p className="mt-4 text-sm text-slate-600">
                            Vous pouvez gérer vos préférences via le bandeau affiché lors de votre première visite ou
                            en bas de chaque page.
                        </p>
                    </Section>

                    {/* ── Pied de page de l'article ── */}
                    <div className="border-t border-slate-100 px-5 pb-6 pt-4 sm:px-6">
                        <p className="text-xs text-slate-400">Dernière mise à jour : juin 2026</p>
                    </div>
                </article>
            </main>
        </div>
    );
}
