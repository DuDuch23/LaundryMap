<?php

namespace App\DataFixtures;

use App\Entity\Adresse;
use App\Enum\StatutGeoEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AdresseFixtures extends Fixture
{
    public const ADRESSE_REFERENCE_PREFIX = 'adresse_';

    private array $adresses = [
        ['adresse' => '12 rue de la Paix',       'rue' => 'rue de la Paix',       'cp' => 75001, 'ville' => 'Paris',      'pays' => 'France', 'lat' => 48.8698,  'lng' => 2.3309],
        ['adresse' => '45 avenue des Flèches',    'rue' => 'avenue des Flèches',    'cp' => 69001, 'ville' => 'Lyon',       'pays' => 'France', 'lat' => 45.7640,  'lng' => 4.8357],
        ['adresse' => '8 boulevard Victor Hugo',  'rue' => 'boulevard Victor Hugo',  'cp' => 13001, 'ville' => 'Marseille',  'pays' => 'France', 'lat' => 43.2965,  'lng' => 5.3698],
        ['adresse' => '3 rue du Moulin',          'rue' => 'rue du Moulin',          'cp' => 75011, 'ville' => 'Paris',      'pays' => 'France', 'lat' => 48.8592,  'lng' => 2.3733],
        ['adresse' => '17 place Bellecour',       'rue' => 'place Bellecour',        'cp' => 69002, 'ville' => 'Lyon',       'pays' => 'France', 'lat' => 45.7581,  'lng' => 4.8320],
        ['adresse' => '22 rue Saint-Ferréol',     'rue' => 'rue Saint-Ferréol',     'cp' => 13001, 'ville' => 'Marseille',  'pays' => 'France', 'lat' => 43.2941,  'lng' => 5.3741],
        ['adresse' => '5 rue de la République',   'rue' => 'rue de la République',   'cp' => 31000, 'ville' => 'Toulouse',   'pays' => 'France', 'lat' => 43.6047,  'lng' => 1.4442],
        ['adresse' => '9 rue du Général de Gaulle', 'rue' => 'rue du Général de Gaulle', 'cp' => 67000, 'ville' => 'Strasbourg','pays' => 'France', 'lat' => 48.5734,  'lng' => 7.7521],
        ['adresse' => '30 avenue Jean Jaurès',    'rue' => 'avenue Jean Jaurès',    'cp' => 59000, 'ville' => 'Lille',      'pays' => 'France', 'lat' => 50.6292,  'lng' => 3.0573],
        ['adresse' => '14 rue du Commerce',       'rue' => 'rue du Commerce',        'cp' => 44000, 'ville' => 'Nantes',     'pays' => 'France', 'lat' => 47.2184,  'lng' => -1.5536],
        ['adresse' => '2 rue de Rivoli',              'rue' => 'rue de Rivoli',              'cp' => 75001, 'ville' => 'Paris',           'pays' => 'France', 'lat' => 48.8607,  'lng' => 2.3467],
        ['adresse' => '18 rue Saint-Antoine',         'rue' => 'rue Saint-Antoine',          'cp' => 75004, 'ville' => 'Paris',           'pays' => 'France', 'lat' => 48.8535,  'lng' => 2.3622],
        ['adresse' => '7 rue de la Roquette',         'rue' => 'rue de la Roquette',         'cp' => 75011, 'ville' => 'Paris',           'pays' => 'France', 'lat' => 48.8534,  'lng' => 2.3736],
        ['adresse' => '33 boulevard de Belleville',   'rue' => 'boulevard de Belleville',    'cp' => 75020, 'ville' => 'Paris',           'pays' => 'France', 'lat' => 48.8683,  'lng' => 2.3791],
        ['adresse' => '10 rue de la Part-Dieu',       'rue' => 'rue de la Part-Dieu',        'cp' => 69003, 'ville' => 'Lyon',            'pays' => 'France', 'lat' => 45.7614,  'lng' => 4.8599],
        ['adresse' => '25 cours Gambetta',            'rue' => 'cours Gambetta',             'cp' => 69007, 'ville' => 'Lyon',            'pays' => 'France', 'lat' => 45.7453,  'lng' => 4.8464],
        ['adresse' => '4 rue de la Guillotière', 'rue' => 'rue de la Guillotière', 'cp' => 69007, 'ville' => 'Lyon',            'pays' => 'France', 'lat' => 45.7510,  'lng' => 4.8446],
        ['adresse' => '56 avenue Foch',               'rue' => 'avenue Foch',                'cp' => 69006, 'ville' => 'Lyon',            'pays' => 'France', 'lat' => 45.7717,  'lng' => 4.8434],
        ['adresse' => '11 rue Paradis',               'rue' => 'rue Paradis',                'cp' => 13006, 'ville' => 'Marseille',       'pays' => 'France', 'lat' => 43.2902,  'lng' => 5.3750],
        ['adresse' => '3 boulevard Michelet',         'rue' => 'boulevard Michelet',         'cp' => 13009, 'ville' => 'Marseille',       'pays' => 'France', 'lat' => 43.2540,  'lng' => 5.3990],
        ['adresse' => '40 rue de Rome',               'rue' => 'rue de Rome',                'cp' => 13006, 'ville' => 'Marseille',       'pays' => 'France', 'lat' => 43.2864,  'lng' => 5.3779],
        ['adresse' => '19 avenue du Prado',           'rue' => 'avenue du Prado',            'cp' => 13006, 'ville' => 'Marseille',       'pays' => 'France', 'lat' => 43.2780,  'lng' => 5.3820],
        ['adresse' => '14 rue Alsace-Lorraine',       'rue' => 'rue Alsace-Lorraine',        'cp' => 31000, 'ville' => 'Toulouse',        'pays' => 'France', 'lat' => 43.6009,  'lng' => 1.4451],
        ['adresse' => '8 place Wilson',               'rue' => 'place Wilson',               'cp' => 31000, 'ville' => 'Toulouse',        'pays' => 'France', 'lat' => 43.6034,  'lng' => 1.4481],
        ['adresse' => '22 rue de Metz',               'rue' => 'rue de Metz',                'cp' => 31000, 'ville' => 'Toulouse',        'pays' => 'France', 'lat' => 43.6023,  'lng' => 1.4400],
        ['adresse' => '5 allée Jean Jaurès',     'rue' => 'allée Jean Jaurès',     'cp' => 31000, 'ville' => 'Toulouse',        'pays' => 'France', 'lat' => 43.6066,  'lng' => 1.4521],
        ['adresse' => '12 cours de l\'Intendance',    'rue' => 'cours de l\'Intendance',     'cp' => 33000, 'ville' => 'Bordeaux',        'pays' => 'France', 'lat' => 44.8424,  'lng' => -0.5739],
        ['adresse' => '6 rue Sainte-Catherine',       'rue' => 'rue Sainte-Catherine',       'cp' => 33000, 'ville' => 'Bordeaux',        'pays' => 'France', 'lat' => 44.8391,  'lng' => -0.5736],
        ['adresse' => '30 rue du Palais Gallien',     'rue' => 'rue du Palais Gallien',      'cp' => 33000, 'ville' => 'Bordeaux',        'pays' => 'France', 'lat' => 44.8453,  'lng' => -0.5830],
        ['adresse' => '18 quai des Chartrons',        'rue' => 'quai des Chartrons',         'cp' => 33000, 'ville' => 'Bordeaux',        'pays' => 'France', 'lat' => 44.8531,  'lng' => -0.5715],
        ['adresse' => '9 rue Nationale',              'rue' => 'rue Nationale',              'cp' => 59000, 'ville' => 'Lille',           'pays' => 'France', 'lat' => 50.6367,  'lng' => 3.0636],
        ['adresse' => '21 place du Général de Gaulle', 'rue' => 'place du Général de Gaulle', 'cp' => 59000, 'ville' => 'Lille', 'pays' => 'France', 'lat' => 50.6359,  'lng' => 3.0635],
        ['adresse' => '4 rue Fénelon',           'rue' => 'rue Fénelon',           'cp' => 59000, 'ville' => 'Lille',           'pays' => 'France', 'lat' => 50.6290,  'lng' => 3.0602],
        ['adresse' => '15 boulevard de la Liberté', 'rue' => 'boulevard de la Liberté', 'cp' => 59000, 'ville' => 'Lille',      'pays' => 'France', 'lat' => 50.6325,  'lng' => 3.0590],
        ['adresse' => '7 rue des Carmes',             'rue' => 'rue des Carmes',             'cp' => 44000, 'ville' => 'Nantes',          'pays' => 'France', 'lat' => 47.2174,  'lng' => -1.5520],
        ['adresse' => '3 place Graslin',              'rue' => 'place Graslin',              'cp' => 44000, 'ville' => 'Nantes',          'pays' => 'France', 'lat' => 47.2154,  'lng' => -1.5587],
        ['adresse' => '29 rue du Calvaire',           'rue' => 'rue du Calvaire',            'cp' => 44000, 'ville' => 'Nantes',          'pays' => 'France', 'lat' => 47.2140,  'lng' => -1.5543],
        ['adresse' => '11 quai de la Fosse',          'rue' => 'quai de la Fosse',           'cp' => 44000, 'ville' => 'Nantes',          'pays' => 'France', 'lat' => 47.2153,  'lng' => -1.5659],
        ['adresse' => '6 avenue Jean Médecin',   'rue' => 'avenue Jean Médecin',   'cp' => 06000, 'ville' => 'Nice',            'pays' => 'France', 'lat' => 43.7076,  'lng' => 7.2670],
        ['adresse' => '14 rue de la Libération', 'rue' => 'rue de la Libération',  'cp' => 06000, 'ville' => 'Nice',            'pays' => 'France', 'lat' => 43.7029,  'lng' => 7.2712],
        ['adresse' => '3 avenue de la Victoire',      'rue' => 'avenue de la Victoire',      'cp' => 06000, 'ville' => 'Nice',            'pays' => 'France', 'lat' => 43.7055,  'lng' => 7.2690],
        ['adresse' => '20 rue Gioffredo',             'rue' => 'rue Gioffredo',              'cp' => 06000, 'ville' => 'Nice',            'pays' => 'France', 'lat' => 43.6984,  'lng' => 7.2745],
        ['adresse' => '2 place Kléber',          'rue' => 'place Kléber',          'cp' => 67000, 'ville' => 'Strasbourg',      'pays' => 'France', 'lat' => 48.5840,  'lng' => 7.7487],
        ['adresse' => '17 rue du Vieux Marché',  'rue' => 'rue du Vieux Marché',   'cp' => 67000, 'ville' => 'Strasbourg',      'pays' => 'France', 'lat' => 48.5815,  'lng' => 7.7451],
        ['adresse' => '8 rue des Hallebardes',        'rue' => 'rue des Hallebardes',        'cp' => 67000, 'ville' => 'Strasbourg',      'pays' => 'France', 'lat' => 48.5830,  'lng' => 7.7468],
        ['adresse' => '25 avenue des Vosges',         'rue' => 'avenue des Vosges',          'cp' => 67000, 'ville' => 'Strasbourg',      'pays' => 'France', 'lat' => 48.5802,  'lng' => 7.7380],
        ['adresse' => '5 rue Saint-Georges',          'rue' => 'rue Saint-Georges',          'cp' => 35000, 'ville' => 'Rennes',          'pays' => 'France', 'lat' => 48.1113,  'lng' => -1.6787],
        ['adresse' => '12 place de la République', 'rue' => 'place de la République', 'cp' => 35000, 'ville' => 'Rennes',       'pays' => 'France', 'lat' => 48.1126,  'lng' => -1.6743],
        ['adresse' => '28 rue d\'Antrain',            'rue' => 'rue d\'Antrain',             'cp' => 35000, 'ville' => 'Rennes',          'pays' => 'France', 'lat' => 48.1179,  'lng' => -1.6801],
        ['adresse' => '3 boulevard de la Tour d\'Auvergne', 'rue' => 'boulevard de la Tour d\'Auvergne', 'cp' => 35000, 'ville' => 'Rennes', 'pays' => 'France', 'lat' => 48.1099, 'lng' => -1.6785],
        ['adresse' => '9 place de la Comédie',   'rue' => 'place de la Comédie',   'cp' => 34000, 'ville' => 'Montpellier',     'pays' => 'France', 'lat' => 43.6089,  'lng' => 3.8797],
        ['adresse' => '16 rue de la Loge',            'rue' => 'rue de la Loge',             'cp' => 34000, 'ville' => 'Montpellier',     'pays' => 'France', 'lat' => 43.6074,  'lng' => 3.8781],
        ['adresse' => '7 avenue de la Libération', 'rue' => 'avenue de la Libération', 'cp' => 34000, 'ville' => 'Montpellier', 'pays' => 'France', 'lat' => 43.6050,  'lng' => 3.8833],
        ['adresse' => '22 rue Foch',                  'rue' => 'rue Foch',                   'cp' => 34000, 'ville' => 'Montpellier',     'pays' => 'France', 'lat' => 43.6097,  'lng' => 3.8761],
        ['adresse' => '4 place Victor Hugo',          'rue' => 'place Victor Hugo',          'cp' => 38000, 'ville' => 'Grenoble',        'pays' => 'France', 'lat' => 45.1863,  'lng' => 5.7259],
        ['adresse' => '11 rue Félix Viallet',    'rue' => 'rue Félix Viallet',     'cp' => 38000, 'ville' => 'Grenoble',        'pays' => 'France', 'lat' => 45.1844,  'lng' => 5.7298],
        ['adresse' => '30 cours Berriat',             'rue' => 'cours Berriat',              'cp' => 38000, 'ville' => 'Grenoble',        'pays' => 'France', 'lat' => 45.1856,  'lng' => 5.7115],
        ['adresse' => '19 avenue Alsace-Lorraine',    'rue' => 'avenue Alsace-Lorraine',     'cp' => 38000, 'ville' => 'Grenoble',        'pays' => 'France', 'lat' => 45.1878,  'lng' => 5.7230],
        ['adresse' => '6 rue du Gros Horloge',        'rue' => 'rue du Gros Horloge',        'cp' => 76000, 'ville' => 'Rouen',           'pays' => 'France', 'lat' => 49.4427,  'lng' => 1.0939],
        ['adresse' => '14 place du Vieux Marché','rue' => 'place du Vieux Marché', 'cp' => 76000, 'ville' => 'Rouen',           'pays' => 'France', 'lat' => 49.4424,  'lng' => 1.0893],
        ['adresse' => '3 rue de la République',  'rue' => 'rue de la République',  'cp' => 76000, 'ville' => 'Rouen',           'pays' => 'France', 'lat' => 49.4435,  'lng' => 1.0952],
        ['adresse' => '21 rue Jeanne d\'Arc',         'rue' => 'rue Jeanne d\'Arc',          'cp' => 76000, 'ville' => 'Rouen',           'pays' => 'France', 'lat' => 49.4392,  'lng' => 1.0905],
        ['adresse' => '8 avenue Général Leclerc', 'rue' => 'avenue Général Leclerc', 'cp' => 83000, 'ville' => 'Toulon', 'pays' => 'France', 'lat' => 43.1233, 'lng' => 5.9296],
        ['adresse' => '15 rue Anatole France',        'rue' => 'rue Anatole France',         'cp' => 83000, 'ville' => 'Toulon',          'pays' => 'France', 'lat' => 43.1254,  'lng' => 5.9279],
        ['adresse' => '22 boulevard de Strasbourg',   'rue' => 'boulevard de Strasbourg',    'cp' => 83000, 'ville' => 'Toulon',          'pays' => 'France', 'lat' => 43.1268,  'lng' => 5.9264],
        ['adresse' => '4 place de la Liberté',   'rue' => 'place de la Liberté',   'cp' => 83000, 'ville' => 'Toulon',          'pays' => 'France', 'lat' => 43.1245,  'lng' => 5.9300],
        ['adresse' => '10 rue de la Liberté',    'rue' => 'rue de la Liberté',     'cp' => 21000, 'ville' => 'Dijon',           'pays' => 'France', 'lat' => 47.3215,  'lng' => 5.0414],
        ['adresse' => '5 place Darcy',                'rue' => 'place Darcy',                'cp' => 21000, 'ville' => 'Dijon',           'pays' => 'France', 'lat' => 47.3241,  'lng' => 5.0398],
        ['adresse' => '18 rue des Forges',            'rue' => 'rue des Forges',             'cp' => 21000, 'ville' => 'Dijon',           'pays' => 'France', 'lat' => 47.3203,  'lng' => 5.0422],
        ['adresse' => '27 rue de la Préfecture', 'rue' => 'rue de la Préfecture',  'cp' => 21000, 'ville' => 'Dijon',           'pays' => 'France', 'lat' => 47.3198,  'lng' => 5.0437],
        ['adresse' => '3 rue Saint-Aubin',            'rue' => 'rue Saint-Aubin',            'cp' => 49000, 'ville' => 'Angers',          'pays' => 'France', 'lat' => 47.4746,  'lng' => -0.5596],
        ['adresse' => '17 boulevard du Roi René','rue' => 'boulevard du Roi René', 'cp' => 49000, 'ville' => 'Angers',          'pays' => 'France', 'lat' => 47.4713,  'lng' => -0.5568],
        ['adresse' => '8 place du Ralliement',        'rue' => 'place du Ralliement',        'cp' => 49000, 'ville' => 'Angers',          'pays' => 'France', 'lat' => 47.4726,  'lng' => -0.5551],
        ['adresse' => '24 rue d\'Alsace',             'rue' => 'rue d\'Alsace',              'cp' => 49000, 'ville' => 'Angers',          'pays' => 'France', 'lat' => 47.4762,  'lng' => -0.5612],
        ['adresse' => '5 place Saint-Louis',          'rue' => 'place Saint-Louis',          'cp' => 57000, 'ville' => 'Metz',            'pays' => 'France', 'lat' => 49.1211,  'lng' => 6.1762],
        ['adresse' => '12 rue Serpenoise',            'rue' => 'rue Serpenoise',             'cp' => 57000, 'ville' => 'Metz',            'pays' => 'France', 'lat' => 49.1192,  'lng' => 6.1757],
        ['adresse' => '8 avenue Robert Schuman',      'rue' => 'avenue Robert Schuman',      'cp' => 57000, 'ville' => 'Metz',            'pays' => 'France', 'lat' => 49.1167,  'lng' => 6.1723],
        ['adresse' => '30 rue du Paradis',            'rue' => 'rue du Paradis',             'cp' => 57000, 'ville' => 'Metz',            'pays' => 'France', 'lat' => 49.1224,  'lng' => 6.1786],
        ['adresse' => '6 rue de Siam',                'rue' => 'rue de Siam',                'cp' => 29200, 'ville' => 'Brest',           'pays' => 'France', 'lat' => 48.3896,  'lng' => -4.4874],
        ['adresse' => '14 place de la Liberté',  'rue' => 'place de la Liberté',   'cp' => 29200, 'ville' => 'Brest',           'pays' => 'France', 'lat' => 48.3902,  'lng' => -4.4831],
        ['adresse' => '3 avenue Clemenceau',          'rue' => 'avenue Clemenceau',          'cp' => 29200, 'ville' => 'Brest',           'pays' => 'France', 'lat' => 48.3878,  'lng' => -4.4858],
        ['adresse' => '22 rue Jean Jaurès',      'rue' => 'rue Jean Jaurès',       'cp' => 29200, 'ville' => 'Brest',           'pays' => 'France', 'lat' => 48.3912,  'lng' => -4.4893],
        ['adresse' => '7 rue de Paris',               'rue' => 'rue de Paris',               'cp' => 76600, 'ville' => 'Le Havre',        'pays' => 'France', 'lat' => 49.4940,  'lng' => 0.1076],
        ['adresse' => '19 avenue Foch',               'rue' => 'avenue Foch',                'cp' => 76600, 'ville' => 'Le Havre',        'pays' => 'France', 'lat' => 49.4932,  'lng' => 0.1050],
        ['adresse' => '4 place de l\'Hôtel de Ville', 'rue' => 'place de l\'Hôtel de Ville', 'cp' => 76600, 'ville' => 'Le Havre', 'pays' => 'France', 'lat' => 49.4946, 'lng' => 0.1077],
        ['adresse' => '11 rue Voltaire',              'rue' => 'rue Voltaire',               'cp' => 76600, 'ville' => 'Le Havre',        'pays' => 'France', 'lat' => 49.4952,  'lng' => 0.1093],
        ['adresse' => '8 place de Jaude',             'rue' => 'place de Jaude',             'cp' => 63000, 'ville' => 'Clermont-Ferrand','pays' => 'France', 'lat' => 45.7791,  'lng' => 3.0843],
        ['adresse' => '15 rue Blatin',                'rue' => 'rue Blatin',                 'cp' => 63000, 'ville' => 'Clermont-Ferrand','pays' => 'France', 'lat' => 45.7768,  'lng' => 3.0862],
        ['adresse' => '3 avenue des États-Unis', 'rue' => 'avenue des États-Unis', 'cp' => 63000, 'ville' => 'Clermont-Ferrand','pays' => 'France', 'lat' => 45.7812,  'lng' => 3.0809],
        ['adresse' => '27 rue du Port',               'rue' => 'rue du Port',                'cp' => 63000, 'ville' => 'Clermont-Ferrand','pays' => 'France', 'lat' => 45.7799,  'lng' => 3.0839],
        ['adresse' => '4 place Stanislas',            'rue' => 'place Stanislas',            'cp' => 54000, 'ville' => 'Nancy',           'pays' => 'France', 'lat' => 48.6934,  'lng' => 6.1833],
        ['adresse' => '9 rue Saint-Dizier',           'rue' => 'rue Saint-Dizier',           'cp' => 54000, 'ville' => 'Nancy',           'pays' => 'France', 'lat' => 48.6917,  'lng' => 6.1832],
        ['adresse' => '20 rue Callot',                'rue' => 'rue Callot',                 'cp' => 54000, 'ville' => 'Nancy',           'pays' => 'France', 'lat' => 48.6941,  'lng' => 6.1812],
        ['adresse' => '6 avenue de la Garenne',       'rue' => 'avenue de la Garenne',       'cp' => 54000, 'ville' => 'Nancy',           'pays' => 'France', 'lat' => 48.6906,  'lng' => 6.1841],
        ['adresse' => '5 place René Goblet',     'rue' => 'place René Goblet',     'cp' => 80000, 'ville' => 'Amiens',          'pays' => 'France', 'lat' => 49.8957,  'lng' => 2.2959],
        ['adresse' => '11 rue des Trois Cailloux',    'rue' => 'rue des Trois Cailloux',     'cp' => 80000, 'ville' => 'Amiens',          'pays' => 'France', 'lat' => 49.8940,  'lng' => 2.2983],
        ['adresse' => '18 boulevard de Belfort',      'rue' => 'boulevard de Belfort',       'cp' => 80000, 'ville' => 'Amiens',          'pays' => 'France', 'lat' => 49.8964,  'lng' => 2.3012],
        ['adresse' => '3 rue des Vergeaux',           'rue' => 'rue des Vergeaux',           'cp' => 80000, 'ville' => 'Amiens',          'pays' => 'France', 'lat' => 49.8947,  'lng' => 2.2945],
        ['adresse' => '7 place Drouet-d\'Erlon',      'rue' => 'place Drouet-d\'Erlon',      'cp' => 51100, 'ville' => 'Reims',           'pays' => 'France', 'lat' => 49.2600,  'lng' => 4.0325],
        ['adresse' => '14 rue de Vesle',              'rue' => 'rue de Vesle',               'cp' => 51100, 'ville' => 'Reims',           'pays' => 'France', 'lat' => 49.2582,  'lng' => 4.0308],
        ['adresse' => '3 course Jean-Baptiste Langlet', 'rue' => 'cours Jean-Baptiste Langlet', 'cp' => 51100, 'ville' => 'Reims',        'pays' => 'France', 'lat' => 49.2568,  'lng' => 4.0347],
        ['adresse' => '21 boulevard Foch',            'rue' => 'boulevard Foch',             'cp' => 51100, 'ville' => 'Reims',           'pays' => 'France', 'lat' => 49.2615,  'lng' => 4.0345],
        ['adresse' => '10 rue de la République', 'rue' => 'rue de la République',  'cp' => 45000, 'ville' => 'Orléans',    'pays' => 'France', 'lat' => 47.9022,  'lng' => 1.9079],
        ['adresse' => '4 place du Marché',       'rue' => 'place du Marché',       'cp' => 45000, 'ville' => 'Orléans',    'pays' => 'France', 'lat' => 47.9009,  'lng' => 1.9043],
        ['adresse' => '26 rue Bannier',               'rue' => 'rue Bannier',                'cp' => 45000, 'ville' => 'Orléans',    'pays' => 'France', 'lat' => 47.9037,  'lng' => 1.9052],
        ['adresse' => '8 rue Sainte-Catherine',       'rue' => 'rue Sainte-Catherine',       'cp' => 45000, 'ville' => 'Orléans',    'pays' => 'France', 'lat' => 47.9018,  'lng' => 1.9060],
        ['adresse' => '5 place de la République','rue' => 'place de la République','cp' => 14000, 'ville' => 'Caen',            'pays' => 'France', 'lat' => 49.1828,  'lng' => -0.3707],
        ['adresse' => '12 rue Saint-Pierre',          'rue' => 'rue Saint-Pierre',           'cp' => 14000, 'ville' => 'Caen',            'pays' => 'France', 'lat' => 49.1828,  'lng' => -0.3670],
        ['adresse' => '19 avenue du 6 Juin',          'rue' => 'avenue du 6 Juin',           'cp' => 14000, 'ville' => 'Caen',            'pays' => 'France', 'lat' => 49.1864,  'lng' => -0.3684],
        ['adresse' => '7 rue des Jacobins',           'rue' => 'rue des Jacobins',           'cp' => 14000, 'ville' => 'Caen',            'pays' => 'France', 'lat' => 49.1838,  'lng' => -0.3695],
        ['adresse' => '2 place Henri IV',             'rue' => 'place Henri IV',             'cp' => 60300, 'ville' => 'Senlis',          'pays' => 'France', 'lat' => 49.2064,  'lng' => 2.5869],
        ['adresse' => '8 rue de la République',       'rue' => 'rue de la République',       'cp' => 60300, 'ville' => 'Senlis',          'pays' => 'France', 'lat' => 49.2071,  'lng' => 2.5883],
        ['adresse' => '14 rue du Chat Haret',         'rue' => 'rue du Chat Haret',          'cp' => 60300, 'ville' => 'Senlis',          'pays' => 'France', 'lat' => 49.2059,  'lng' => 2.5857],
        ['adresse' => '3 avenue Maréchal Joffre',     'rue' => 'avenue Maréchal Joffre',     'cp' => 60300, 'ville' => 'Senlis',          'pays' => 'France', 'lat' => 49.2082,  'lng' => 2.5901],
        ['adresse' => '19 rue Vieille de Paris',      'rue' => 'rue Vieille de Paris',       'cp' => 60300, 'ville' => 'Senlis',          'pays' => 'France', 'lat' => 49.2048,  'lng' => 2.5876],
        // Senlis (suite)
        ['adresse' => '12 avenue du Maréchal Foch',   'rue' => 'avenue du Maréchal Foch',    'cp' => 60300, 'ville' => 'Senlis',          'pays' => 'France', 'lat' => 49.2087,  'lng' => 2.5872],
        ['adresse' => '7 rue Saint-Pierre',            'rue' => 'rue Saint-Pierre',           'cp' => 60300, 'ville' => 'Senlis',          'pays' => 'France', 'lat' => 49.2073,  'lng' => 2.5842],
        ['adresse' => '25 rue de Meaux',               'rue' => 'rue de Meaux',               'cp' => 60300, 'ville' => 'Senlis',          'pays' => 'France', 'lat' => 49.2051,  'lng' => 2.5915],
        ['adresse' => '9 avenue de la Gare',           'rue' => 'avenue de la Gare',          'cp' => 60300, 'ville' => 'Senlis',          'pays' => 'France', 'lat' => 49.2097,  'lng' => 2.5928],
        ['adresse' => '33 rue du Châtel',              'rue' => 'rue du Châtel',              'cp' => 60300, 'ville' => 'Senlis',          'pays' => 'France', 'lat' => 49.2057,  'lng' => 2.5851],
        // Chantilly
        ['adresse' => '42 rue du Connétable',          'rue' => 'rue du Connétable',          'cp' => 60500, 'ville' => 'Chantilly',       'pays' => 'France', 'lat' => 49.1933,  'lng' => 2.4702],
        ['adresse' => '15 avenue du Maréchal Joffre',  'rue' => 'avenue du Maréchal Joffre',  'cp' => 60500, 'ville' => 'Chantilly',       'pays' => 'France', 'lat' => 49.1947,  'lng' => 2.4718],
        ['adresse' => '8 avenue de Paris',             'rue' => 'avenue de Paris',            'cp' => 60500, 'ville' => 'Chantilly',       'pays' => 'France', 'lat' => 49.1961,  'lng' => 2.4694],
        // Creil
        ['adresse' => '17 rue Jules Uhry',             'rue' => 'rue Jules Uhry',             'cp' => 60100, 'ville' => 'Creil',           'pays' => 'France', 'lat' => 49.2587,  'lng' => 2.4819],
        ['adresse' => '5 rue de la République',        'rue' => 'rue de la République',       'cp' => 60100, 'ville' => 'Creil',           'pays' => 'France', 'lat' => 49.2571,  'lng' => 2.4831],
        // Pont-Sainte-Maxence
        ['adresse' => '11 rue de la République',       'rue' => 'rue de la République',       'cp' => 60700, 'ville' => 'Pont-Sainte-Maxence', 'pays' => 'France', 'lat' => 49.3005, 'lng' => 2.6033],
        ['adresse' => '3 avenue du Maréchal Foch',     'rue' => 'avenue du Maréchal Foch',    'cp' => 60700, 'ville' => 'Pont-Sainte-Maxence', 'pays' => 'France', 'lat' => 49.2993, 'lng' => 2.6019],
        // Verberie
        ['adresse' => '14 rue de Paris',               'rue' => 'rue de Paris',               'cp' => 60410, 'ville' => 'Verberie',        'pays' => 'France', 'lat' => 49.3124,  'lng' => 2.5329],
        // Nanteuil-le-Haudouin
        ['adresse' => '6 Grande Rue',                  'rue' => 'Grande Rue',                 'cp' => 60440, 'ville' => 'Nanteuil-le-Haudouin', 'pays' => 'France', 'lat' => 49.1372, 'lng' => 2.8052],
        // Luzarches
        ['adresse' => '22 Grande Rue',                 'rue' => 'Grande Rue',                 'cp' => 95270, 'ville' => 'Luzarches',       'pays' => 'France', 'lat' => 49.1193,  'lng' => 2.4347],
    ];

    public function load(ObjectManager $manager): void
    {
        foreach ($this->adresses as $i => $data) {
            $adresse = new Adresse();
            $adresse->setAdresse($data['adresse']);
            $adresse->setRue($data['rue']);
            $adresse->setCodePostal($data['cp']);
            $adresse->setVille($data['ville']);
            $adresse->setPays($data['pays']);
            $adresse->setLatitude($data['lat']);
            $adresse->setLongitude($data['lng']);
            $adresse->setStatutGeolocalisation(StatutGeoEnum::GEOLOCALISEE);
            $manager->persist($adresse);
            $this->addReference(self::ADRESSE_REFERENCE_PREFIX . $i, $adresse);
        }

        $manager->flush();
    }
}
