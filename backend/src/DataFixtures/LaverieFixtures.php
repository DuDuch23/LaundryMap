<?php

namespace App\DataFixtures;

use App\Entity\Adresse;
use App\Entity\Laverie;
use App\Entity\Media;
use App\Entity\Professionnel;
use App\Enum\StatutLaverieEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class LaverieFixtures extends Fixture implements DependentFixtureInterface
{
    public const LAVERIE_REFERENCE_PREFIX = 'laverie_';

    private array $laveries = [
        ['nom' => 'Laverie du Marais',      'email' => 'marais@laundrymaps.fr',    'desc' => 'Laverie moderne au cœur du Marais.',                'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 3, 'media_idx' => 0],
        ['nom' => 'Laverie Bellecour',       'email' => 'bellecour@laundrymaps.fr', 'desc' => 'Laverie automatique proche de la place Bellecour.', 'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 4, 'media_idx' => 1],
        ['nom' => 'Laverie Saint-Ferréol',  'email' => 'stferreol@laundrymaps.fr', 'desc' => 'Laverie express en centre-ville.',                   'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 5, 'media_idx' => 2],
        ['nom' => 'Laverie Capitole',        'email' => 'capitole@laundrymaps.fr',  'desc' => 'Laverie proche du Capitole, ouverte 7j/7.',          'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 6, 'media_idx' => 3],
        ['nom' => 'Laverie Alsace',          'email' => 'alsace@laundrymaps.fr',    'desc' => "Laverie traditionnelle au cœur de l'Alsace.",          'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 2, 'adresse_idx' => 7, 'media_idx' => 4],
        ['nom' => 'Laverie Rivoli',           'email' => 'rivoli@laundrymaps.fr',        'desc' => 'Laverie au cœur de Paris, rue de Rivoli.',              'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 10, 'media_idx' => 0],
        ['nom' => 'Laverie Saint-Antoine',    'email' => 'st-antoine@laundrymaps.fr',    'desc' => 'Laverie express dans le Marais historique.',            'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 11, 'media_idx' => 1],
        ['nom' => 'Laverie Roquette',         'email' => 'roquette@laundrymaps.fr',      'desc' => 'Laverie de quartier, idéale pour les habitants.',       'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 12, 'media_idx' => 2],
        ['nom' => 'Laverie Belleville',       'email' => 'belleville@laundrymaps.fr',    'desc' => 'Laverie économique dans le quartier de Belleville.',    'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 0, 'adresse_idx' => 13, 'media_idx' => 3],
        ['nom' => 'Laverie Part-Dieu',        'email' => 'part-dieu@laundrymaps.fr',     'desc' => 'Laverie proche du centre commercial Part-Dieu.',        'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 14, 'media_idx' => 4],
        ['nom' => 'Laverie Gambetta Lyon',    'email' => 'gambetta-lyo@laundrymaps.fr',  'desc' => 'Laverie moderne sur les cours Gambetta.',               'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 15, 'media_idx' => 0],
        ['nom' => 'Laverie Guillotière',      'email' => 'guillotiere@laundrymaps.fr',   'desc' => 'Laverie rapide rue de la Guillotière.',                 'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 16, 'media_idx' => 1],
        ['nom' => 'Laverie Croix-Rousse',     'email' => 'croix-rousse@laundrymaps.fr',  'desc' => 'Laverie conviviale avenue Foch à Lyon.',                'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 1, 'adresse_idx' => 17, 'media_idx' => 2],
        ['nom' => 'Laverie Paradis',          'email' => 'paradis-mrs@laundrymaps.fr',   'desc' => 'Laverie automatique rue Paradis, Marseille.',           'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 18, 'media_idx' => 3],
        ['nom' => 'Laverie Michelet',         'email' => 'michelet@laundrymaps.fr',      'desc' => 'Laverie sur le boulevard Michelet.',                    'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 19, 'media_idx' => 4],
        ['nom' => 'Laverie Rome',             'email' => 'rome-mrs@laundrymaps.fr',      'desc' => 'Laverie rue de Rome, proche du centre.',                'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 20, 'media_idx' => 0],
        ['nom' => 'Laverie Prado',            'email' => 'prado@laundrymaps.fr',         'desc' => 'Laverie avenue du Prado, ouverte 7j/7.',                'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 21, 'media_idx' => 1],
        ['nom' => 'Laverie Alsace-Lorraine',  'email' => 'alsace-lorraine@laundrymaps.fr','desc' => 'Laverie centrale rue Alsace-Lorraine, Toulouse.',       'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 22, 'media_idx' => 2],
        ['nom' => 'Laverie Wilson',           'email' => 'wilson-tlse@laundrymaps.fr',   'desc' => 'Laverie à deux pas de la place Wilson.',                'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 1, 'adresse_idx' => 23, 'media_idx' => 3],
        ['nom' => 'Laverie Toulouse Metz',    'email' => 'metz-tlse@laundrymaps.fr',     'desc' => 'Laverie discrète rue de Metz, Toulouse.',               'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 24, 'media_idx' => 4],
        ['nom' => 'Laverie Jaures Toulouse',  'email' => 'jaures-tlse@laundrymaps.fr',   'desc' => 'Laverie allée Jean Jaurès, accès facile.',              'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 25, 'media_idx' => 0],
        ['nom' => 'Laverie Intendance',       'email' => 'intendance@laundrymaps.fr',    'desc' => "Laverie cours de l'Intendance, Bordeaux.",              'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 26, 'media_idx' => 1],
        ['nom' => 'Laverie Sainte-Catherine', 'email' => 'ste-catherine@laundrymaps.fr', 'desc' => "Laverie sur la plus longue rue piétonne de France.",    'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 27, 'media_idx' => 2],
        ['nom' => 'Laverie Gallien',          'email' => 'gallien@laundrymaps.fr',       'desc' => 'Laverie proche du Palais Gallien antique.',             'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 28, 'media_idx' => 3],
        ['nom' => 'Laverie Chartrons',        'email' => 'chartrons@laundrymaps.fr',     'desc' => 'Laverie quai des Chartrons, vue sur la Garonne.',       'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 1, 'adresse_idx' => 29, 'media_idx' => 4],
        ['nom' => 'Laverie Nationale Lille',  'email' => 'nationale-lil@laundrymaps.fr', 'desc' => 'Laverie rue Nationale, en plein centre de Lille.',      'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 30, 'media_idx' => 0],
        ['nom' => 'Laverie Grand-Place',      'email' => 'grand-place@laundrymaps.fr',   'desc' => 'Laverie proche de la Grand-Place de Lille.',            'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 31, 'media_idx' => 1],
        ['nom' => 'Laverie Fénelon',          'email' => 'fenelon-lil@laundrymaps.fr',   'desc' => 'Laverie tranquille rue Fénelon.',                       'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 32, 'media_idx' => 2],
        ['nom' => 'Laverie Liberté Lille',    'email' => 'liberte-lil@laundrymaps.fr',   'desc' => 'Laverie moderne boulevard de la Liberté.',              'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 33, 'media_idx' => 3],
        ['nom' => 'Laverie Carmes Nantes',    'email' => 'carmes-nts@laundrymaps.fr',    'desc' => 'Laverie de quartier rue des Carmes, Nantes.',           'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 34, 'media_idx' => 4],
        ['nom' => 'Laverie Graslin',          'email' => 'graslin@laundrymaps.fr',       'desc' => 'Laverie place Graslin, ambiance théâtre.',              'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 1, 'adresse_idx' => 35, 'media_idx' => 0],
        ['nom' => 'Laverie Calvaire',         'email' => 'calvaire-nts@laundrymaps.fr',  'desc' => 'Laverie rue du Calvaire, Nantes centre.',               'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 36, 'media_idx' => 1],
        ['nom' => 'Laverie Fosse',            'email' => 'fosse@laundrymaps.fr',         'desc' => 'Laverie quai de la Fosse, vue sur la Loire.',           'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 37, 'media_idx' => 2],
        ['nom' => 'Laverie Jean Médecin',     'email' => 'jean-medecin@laundrymaps.fr',  'desc' => "Laverie sur l'artère principale de Nice.",              'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 38, 'media_idx' => 3],
        ['nom' => 'Laverie Liberation Nice',  'email' => 'liberation-nce@laundrymaps.fr','desc' => 'Laverie rue de la Libération, Nice.',                   'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 39, 'media_idx' => 4],
        ['nom' => 'Laverie Victoire Nice',    'email' => 'victoire-nce@laundrymaps.fr',  'desc' => 'Laverie avenue de la Victoire, Nice.',                  'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 40, 'media_idx' => 0],
        ['nom' => 'Laverie Gioffredo',        'email' => 'gioffredo@laundrymaps.fr',     'desc' => 'Laverie rue Gioffredo, pratique en plein centre.',      'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 1, 'adresse_idx' => 41, 'media_idx' => 1],
        ['nom' => 'Laverie Kléber',           'email' => 'kleber@laundrymaps.fr',        'desc' => 'Laverie place Kléber, cœur de Strasbourg.',             'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 42, 'media_idx' => 2],
        ['nom' => 'Laverie Vieux Marché',     'email' => 'vieux-marche@laundrymaps.fr',  'desc' => 'Laverie rue du Vieux Marché, Strasbourg.',              'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 43, 'media_idx' => 3],
        ['nom' => 'Laverie Hallebardes',      'email' => 'hallebardes@laundrymaps.fr',   'desc' => 'Laverie rue des Hallebardes, proche cathédrale.',       'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 44, 'media_idx' => 4],
        ['nom' => 'Laverie Vosges',           'email' => 'vosges-str@laundrymaps.fr',    'desc' => 'Laverie avenue des Vosges, Strasbourg.',                'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 45, 'media_idx' => 0],
        ['nom' => 'Laverie Saint-Georges',    'email' => 'st-georges-rns@laundrymaps.fr','desc' => 'Laverie rue Saint-Georges, Rennes.',                    'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 46, 'media_idx' => 1],
        ['nom' => 'Laverie République Rennes','email' => 'rep-rns@laundrymaps.fr',       'desc' => 'Laverie place de la République, Rennes.',               'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 1, 'adresse_idx' => 47, 'media_idx' => 2],
        ['nom' => 'Laverie Antrain',          'email' => 'antrain@laundrymaps.fr',       'desc' => "Laverie rue d'Antrain, au cœur du vieux Rennes.",       'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 48, 'media_idx' => 3],
        ['nom' => "Laverie Tour d'Auvergne",  'email' => 'auvergne-rns@laundrymaps.fr',  'desc' => "Laverie boulevard de la Tour d'Auvergne.",              'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 49, 'media_idx' => 4],
        ['nom' => 'Laverie Comédie',          'email' => 'comedie-mtp@laundrymaps.fr',   'desc' => 'Laverie place de la Comédie, Montpellier.',             'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 50, 'media_idx' => 0],
        ['nom' => 'Laverie de la Loge',       'email' => 'loge-mtp@laundrymaps.fr',      'desc' => 'Laverie rue de la Loge, vieille ville.',                'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 51, 'media_idx' => 1],
        ['nom' => 'Laverie Libération Mtp',   'email' => 'liberation-mtp@laundrymaps.fr','desc' => 'Laverie avenue de la Libération, Montpellier.',          'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 52, 'media_idx' => 2],
        ['nom' => 'Laverie Foch Montpellier', 'email' => 'foch-mtp@laundrymaps.fr',      'desc' => 'Laverie rue Foch, accès tram direct.',                  'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 1, 'adresse_idx' => 53, 'media_idx' => 3],
        ['nom' => 'Laverie Victor Hugo Gre',  'email' => 'victor-hugo-gre@laundrymaps.fr','desc' => 'Laverie place Victor Hugo, Grenoble.',                  'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 54, 'media_idx' => 4],
        ['nom' => 'Laverie Félix Viallet',    'email' => 'felix-viallet@laundrymaps.fr', 'desc' => 'Laverie rue Félix Viallet, proche gare.',               'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 55, 'media_idx' => 0],
        ['nom' => 'Laverie Berriat',          'email' => 'berriat@laundrymaps.fr',       'desc' => 'Laverie cours Berriat, ambiance village.',              'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 56, 'media_idx' => 1],
        ['nom' => 'Laverie Alsace Grenoble',  'email' => 'alsace-gre@laundrymaps.fr',    'desc' => 'Laverie avenue Alsace-Lorraine, Grenoble.',             'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 57, 'media_idx' => 2],
        ['nom' => 'Laverie Gros Horloge',     'email' => 'gros-horloge@laundrymaps.fr',  'desc' => 'Laverie rue du Gros Horloge, Rouen.',                   'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 58, 'media_idx' => 3],
        ['nom' => 'Laverie Vieux Marché Rn',  'email' => 'vieux-marche-rn@laundrymaps.fr','desc' => 'Laverie place du Vieux Marché, Rouen.',                 'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 1, 'adresse_idx' => 59, 'media_idx' => 4],
        ['nom' => 'Laverie République Rouen', 'email' => 'rep-rouen@laundrymaps.fr',     'desc' => 'Laverie rue de la République, Rouen.',                  'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 60, 'media_idx' => 0],
        ['nom' => "Laverie Jeanne d'Arc",     'email' => 'jeanne-darc@laundrymaps.fr',   'desc' => "Laverie près du mémorial Jeanne d'Arc.",                'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 61, 'media_idx' => 1],
        ['nom' => 'Laverie Leclerc Toulon',   'email' => 'leclerc-tln@laundrymaps.fr',   'desc' => 'Laverie avenue Général Leclerc, Toulon.',               'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 62, 'media_idx' => 2],
        ['nom' => 'Laverie Anatole France',   'email' => 'anatole-france@laundrymaps.fr','desc' => 'Laverie rue Anatole France, Toulon.',                    'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 63, 'media_idx' => 3],
        ['nom' => 'Laverie Strasbourg Tln',   'email' => 'strasbourg-tln@laundrymaps.fr','desc' => 'Laverie boulevard de Strasbourg, Toulon.',               'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 0, 'adresse_idx' => 64, 'media_idx' => 4],
        ['nom' => 'Laverie Liberté Toulon',   'email' => 'liberte-tln@laundrymaps.fr',   'desc' => 'Laverie place de la Liberté, Toulon.',                  'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 65, 'media_idx' => 0],
        ['nom' => 'Laverie Liberté Dijon',    'email' => 'liberte-dij@laundrymaps.fr',   'desc' => 'Laverie rue de la Liberté, cœur de Dijon.',             'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 66, 'media_idx' => 1],
        ['nom' => 'Laverie Darcy',            'email' => 'darcy@laundrymaps.fr',         'desc' => 'Laverie place Darcy, Dijon.',                           'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 67, 'media_idx' => 2],
        ['nom' => 'Laverie des Forges',       'email' => 'forges-dij@laundrymaps.fr',    'desc' => 'Laverie rue des Forges, Dijon centre.',                 'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 68, 'media_idx' => 3],
        ['nom' => 'Laverie Préfecture Dijon', 'email' => 'prefecture-dij@laundrymaps.fr','desc' => 'Laverie rue de la Préfecture, Dijon.',                   'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 2, 'adresse_idx' => 69, 'media_idx' => 4],
        ['nom' => 'Laverie Saint-Aubin',      'email' => 'st-aubin@laundrymaps.fr',      'desc' => 'Laverie rue Saint-Aubin, Angers.',                      'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 70, 'media_idx' => 0],
        ['nom' => 'Laverie Roi René',         'email' => 'roi-rene@laundrymaps.fr',      'desc' => 'Laverie boulevard du Roi René, Angers.',                'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 71, 'media_idx' => 1],
        ['nom' => 'Laverie Ralliement',       'email' => 'ralliement@laundrymaps.fr',    'desc' => 'Laverie place du Ralliement, Angers.',                  'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 72, 'media_idx' => 2],
        ['nom' => 'Laverie Alsace Angers',    'email' => 'alsace-ang@laundrymaps.fr',    'desc' => "Laverie rue d'Alsace, Angers.",                         'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 73, 'media_idx' => 3],
        ['nom' => 'Laverie Saint-Louis',      'email' => 'st-louis-mtz@laundrymaps.fr',  'desc' => 'Laverie place Saint-Louis, Metz.',                      'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 74, 'media_idx' => 4],
        ['nom' => 'Laverie Serpenoise',       'email' => 'serpenoise@laundrymaps.fr',    'desc' => 'Laverie rue Serpenoise, artère principale de Metz.',    'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 2, 'adresse_idx' => 75, 'media_idx' => 0],
        ['nom' => 'Laverie Schuman',          'email' => 'schuman@laundrymaps.fr',       'desc' => 'Laverie avenue Robert Schuman, Metz.',                  'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 76, 'media_idx' => 1],
        ['nom' => 'Laverie Paradis Metz',     'email' => 'paradis-mtz@laundrymaps.fr',   'desc' => 'Laverie rue du Paradis, quartier historique.',          'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 77, 'media_idx' => 2],
        ['nom' => 'Laverie Siam',             'email' => 'siam@laundrymaps.fr',          'desc' => 'Laverie rue de Siam, Brest.',                           'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 78, 'media_idx' => 3],
        ['nom' => 'Laverie Liberté Brest',    'email' => 'liberte-brs@laundrymaps.fr',   'desc' => 'Laverie place de la Liberté, Brest.',                   'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 79, 'media_idx' => 4],
        ['nom' => 'Laverie Clemenceau Brest', 'email' => 'clemenceau-brs@laundrymaps.fr','desc' => 'Laverie avenue Clemenceau, Brest.',                      'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 80, 'media_idx' => 0],
        ['nom' => 'Laverie Jaurès Brest',     'email' => 'jaures-brs@laundrymaps.fr',    'desc' => 'Laverie rue Jean Jaurès, Brest.',                       'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 2, 'adresse_idx' => 81, 'media_idx' => 1],
        ['nom' => 'Laverie Paris Le Havre',   'email' => 'paris-lhv@laundrymaps.fr',     'desc' => 'Laverie rue de Paris, Le Havre.',                       'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 82, 'media_idx' => 2],
        ['nom' => 'Laverie Foch Le Havre',    'email' => 'foch-lhv@laundrymaps.fr',      'desc' => 'Laverie avenue Foch, Le Havre, port en bord de mer.',  'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 83, 'media_idx' => 3],
        ['nom' => 'Laverie Hôtel de Ville LH','email' => 'hdv-lhv@laundrymaps.fr',       'desc' => "Laverie place de l'Hôtel de Ville, Le Havre.",          'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 84, 'media_idx' => 4],
        ['nom' => 'Laverie Voltaire Le Havre','email' => 'voltaire-lhv@laundrymaps.fr',  'desc' => 'Laverie rue Voltaire, Le Havre.',                       'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 85, 'media_idx' => 0],
        ['nom' => 'Laverie Jaude',            'email' => 'jaude@laundrymaps.fr',         'desc' => 'Laverie place de Jaude, Clermont-Ferrand.',             'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 86, 'media_idx' => 1],
        ['nom' => 'Laverie Blatin',           'email' => 'blatin@laundrymaps.fr',        'desc' => 'Laverie rue Blatin, Clermont-Ferrand.',                 'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 2, 'adresse_idx' => 87, 'media_idx' => 2],
        ['nom' => 'Laverie États-Unis',       'email' => 'etats-unis@laundrymaps.fr',    'desc' => 'Laverie avenue des États-Unis, Clermont.',              'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 88, 'media_idx' => 3],
        ['nom' => 'Laverie du Port Clermont', 'email' => 'port-clf@laundrymaps.fr',      'desc' => 'Laverie rue du Port, Clermont-Ferrand.',                'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 89, 'media_idx' => 4],
        ['nom' => 'Laverie Stanislas',        'email' => 'stanislas@laundrymaps.fr',     'desc' => 'Laverie place Stanislas, joyau de Nancy.',              'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 90, 'media_idx' => 0],
        ['nom' => 'Laverie Saint-Dizier',     'email' => 'st-dizier@laundrymaps.fr',     'desc' => 'Laverie rue Saint-Dizier, Nancy.',                      'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 91, 'media_idx' => 1],
        ['nom' => 'Laverie Callot',           'email' => 'callot-ncy@laundrymaps.fr',    'desc' => 'Laverie rue Callot, quartier calme de Nancy.',          'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 92, 'media_idx' => 2],
        ['nom' => 'Laverie Garenne',          'email' => 'garenne-ncy@laundrymaps.fr',   'desc' => 'Laverie avenue de la Garenne, Nancy.',                  'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 2, 'adresse_idx' => 93, 'media_idx' => 3],
        ['nom' => 'Laverie René Goblet',      'email' => 'rene-goblet@laundrymaps.fr',   'desc' => 'Laverie place René Goblet, Amiens.',                    'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 94, 'media_idx' => 4],
        ['nom' => 'Laverie Trois Cailloux',   'email' => 'trois-cailloux@laundrymaps.fr','desc' => 'Laverie rue des Trois Cailloux, Amiens.',                'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 95, 'media_idx' => 0],
        ['nom' => 'Laverie Belfort',          'email' => 'belfort-ami@laundrymaps.fr',   'desc' => 'Laverie boulevard de Belfort, Amiens.',                 'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 96, 'media_idx' => 1],
        ['nom' => 'Laverie Vergeaux',         'email' => 'vergeaux@laundrymaps.fr',      'desc' => 'Laverie rue des Vergeaux, Amiens.',                     'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 97, 'media_idx' => 2],
        ['nom' => "Laverie Drouet-d'Erlon",   'email' => 'drouet-derlon@laundrymaps.fr', 'desc' => 'Laverie sur la célèbre avenue de Reims.',               'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 98, 'media_idx' => 3],
        ['nom' => 'Laverie Vesle',            'email' => 'vesle@laundrymaps.fr',         'desc' => 'Laverie rue de Vesle, Reims.',                          'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 2, 'adresse_idx' => 99, 'media_idx' => 4],
        ['nom' => 'Laverie Langlet',          'email' => 'langlet@laundrymaps.fr',       'desc' => 'Laverie cours Langlet, près de la cathédrale.',         'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 100, 'media_idx' => 0],
        ['nom' => 'Laverie Foch Reims',       'email' => 'foch-reims@laundrymaps.fr',    'desc' => 'Laverie boulevard Foch, Reims.',                        'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 101, 'media_idx' => 1],
        ['nom' => 'Laverie République Orléans','email' => 'rep-orleans@laundrymaps.fr',  'desc' => 'Laverie rue de la République, Orléans.',                'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 102, 'media_idx' => 2],
        ['nom' => 'Laverie Marché Orléans',   'email' => 'marche-orl@laundrymaps.fr',   'desc' => 'Laverie place du Marché, Orléans.',                      'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 103, 'media_idx' => 3],
        ['nom' => 'Laverie Bannier',          'email' => 'bannier@laundrymaps.fr',       'desc' => 'Laverie rue Bannier, Orléans.',                         'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 104, 'media_idx' => 4],
        ['nom' => 'Laverie Sainte-Cath Orl',  'email' => 'ste-cath-orl@laundrymaps.fr', 'desc' => 'Laverie rue Sainte-Catherine, Orléans.',                 'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 105, 'media_idx' => 0],
        ['nom' => 'Laverie République Caen',  'email' => 'rep-caen@laundrymaps.fr',      'desc' => 'Laverie place de la République, Caen.',                 'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 0, 'adresse_idx' => 106, 'media_idx' => 1],
        ['nom' => 'Laverie Saint-Pierre Caen','email' => 'st-pierre-caen@laundrymaps.fr','desc' => 'Laverie rue Saint-Pierre, Caen.',                        'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 107, 'media_idx' => 2],
        ['nom' => 'Laverie 6 Juin',           'email' => 'six-juin@laundrymaps.fr',      'desc' => 'Laverie avenue du 6 Juin, Caen.',                       'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 108, 'media_idx' => 3],
        ['nom' => 'Laverie Jacobins',         'email' => 'jacobins@laundrymaps.fr',      'desc' => 'Laverie rue des Jacobins, Caen.',                       'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 109, 'media_idx' => 4],
        ['nom' => 'Laverie Henri IV',          'email' => 'henriiv@laundrymaps.fr',       'desc' => 'Laverie place Henri IV, face à la cathédrale de Senlis.',  'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 110, 'media_idx' => 0],
        ['nom' => 'Laverie République Senlis', 'email' => 'rep-senlis@laundrymaps.fr',    'desc' => 'Laverie rue de la République, centre historique.',          'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 1, 'adresse_idx' => 111, 'media_idx' => 1],
        ['nom' => 'Laverie Chat Haret',        'email' => 'chat-haret@laundrymaps.fr',    'desc' => 'Laverie dans une ruelle médiévale du vieux Senlis.',        'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 2, 'adresse_idx' => 112, 'media_idx' => 2],
        ['nom' => 'Laverie Joffre',            'email' => 'joffre-senlis@laundrymaps.fr', 'desc' => 'Laverie avenue Maréchal Joffre, proche gare de Senlis.',    'statut' => StatutLaverieEnum::STATUT_VALIDEE,    'pro_idx' => 0, 'adresse_idx' => 113, 'media_idx' => 3],
        ['nom' => 'Laverie Vieille de Paris',  'email' => 'vieille-paris@laundrymaps.fr', 'desc' => 'Laverie sur l\'ancienne route royale vers Paris.',           'statut' => StatutLaverieEnum::STATUT_EN_ATTENTE, 'pro_idx' => 1, 'adresse_idx' => 114, 'media_idx' => 4],
    ];

    public function load(ObjectManager $manager): void
    {
        $now = new \DateTime();

        foreach ($this->laveries as $i => $data) {
            $pro = $this->getReference(ProfessionnelFixtures::PROFESSIONNEL_REFERENCE_PREFIX . $data['pro_idx'], Professionnel::class);
            $adresse = $this->getReference(AdresseFixtures::ADRESSE_REFERENCE_PREFIX . $data['adresse_idx'], Adresse::class);
            $logo = $this->getReference(MediaFixtures::MEDIA_REFERENCE_PREFIX . $data['media_idx'], Media::class);

            $laverie = new Laverie();
            $laverie->setProfessionnel($pro);
            $laverie->setNomEtablissement($data['nom']);
            $laverie->setContactEmail($data['email']);
            $laverie->setDescription($data['desc']);
            $laverie->setStatut($data['statut']);
            $laverie->setAdresse($adresse);
            $laverie->setLogo($logo);
            $laverie->setDateAjout($now);
            $laverie->setDateModification($now);
            $manager->persist($laverie);
            $this->addReference(self::LAVERIE_REFERENCE_PREFIX . $i, $laverie);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            ProfessionnelFixtures::class,
            AdresseFixtures::class,
            MediaFixtures::class,
        ];
    }
}
