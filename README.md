# themoviedb-discovery-app

Application web de découverte de films qui s'appuie sur l'API de [The Movie Database (TMDB)](https://www.themoviedb.org/). Elle affiche les films populaires en France et permet de consulter leur fiche détaillée.

## Fonctionnalités

- Liste des films populaires, avec pagination et paramètres de langue et de région.
- Fiche détaillée pour chaque film.
- Pages « À propos » et « Page introuvable ».
- Thème clair ou sombre, conservé dans le navigateur.
- API Express intermédiaire pour appeler TMDB sans exposer le jeton dans le navigateur.

Les paramètres par défaut sont la langue `fr-FR`, la région `FR` et la première page.

## Prérequis

- Node.js 24 (version indiquée dans `.nvmrc`).
- npm.
- Un jeton d'accès à l'API TMDB. Vous pouvez en obtenir un depuis les paramètres de votre compte TMDB, dans la section API.

## Installation et démarrage

1. Installez les dépendances :

   ```sh
   npm install
   ```

2. Créez un fichier `.env` à la racine du projet et ajoutez votre jeton d'accès :

   ```dotenv
   TMDB_ACCESS_TOKEN=votre_jeton_d_acces_tmdb
   ```

   Gardez ce jeton privé et ne le publiez pas dans le dépôt.

3. Démarrez le serveur et l'application :

   ```sh
   npm run dev
   ```

4. Ouvrez [http://localhost:5173](http://localhost:5173).

Le serveur Express écoute sur le port `3000`. Vite sert l'interface sur le port `5173` et transmet les requêtes `/api` au serveur Express.

## Storybook

Storybook permet de visualiser les pages et les futurs widgets du dashboard
indépendamment de l'application et de l'API TMDB. Le jeton TMDB et la base
SQLite ne sont donc pas nécessaires pour le lancer.

Pour démarrer Storybook en mode développement :

```sh
npm run storybook
```

Ouvrez ensuite [http://localhost:6006](http://localhost:6006). Les stories du
dashboard disponibles sont :

- `Dashboard/DashboardPage`, qui présente le tableau de bord sans widget ;
- `Dashboard/Future widget states`, qui permet de visualiser les états
  `loading`, `empty`, `error` et `ready` ;
- `Dashboard/Genres représentés`, qui montre le total des genres distincts
  ainsi que les états zéro, valeur inconnue, chargement et erreur ;
- `Dashboard/Genre dominant`, qui montre le genre le plus représenté et son
  effectif parmi les films ;
- `Dashboard/BestRatedGenreWidget`, qui montre le genre ayant la meilleure
  moyenne simple et ses états ;
- `Dashboard/BestWeightedRatedGenreWidget`, qui montre le genre ayant la
  meilleure note pondérée et ses états.

### Contrat du widget « Genres représentés »

Le composant reçoit un objet `GenresRepresentedWidgetData` défini dans
`MoviesTypes.ts`. Sa propriété `genre_count` contient le nombre de genres
distincts déjà calculé (`number`) ou `null` si le nombre est inconnu. Le widget
affiche ce total avec son unité ; il ne compte pas les associations entre films
et genres. Une valeur de zéro est un résultat valide et distinct d'une valeur
inconnue.

### Contrat du widget « Genre dominant »

Le composant reçoit un objet `DominantGenreWidgetData` défini dans
`MoviesTypes.ts`, avec `genre_name` et `movie_count`, tous deux éventuellement
`null` lorsqu'ils sont inconnus. Le genre et son effectif sont calculés en
amont ; le widget affiche le résultat reçu et ne recompte pas les associations
film-genre. Un nom ou un effectif absent est indiqué comme inconnu, tandis que
l'absence de genre connu utilise l'état `empty`.

### Contrat du widget « Meilleure note par genre »

Le composant reçoit un objet `BestRatedGenreWidgetData` défini dans
`MoviesTypes.ts`, avec `genre_name` et `average_simple_rating`, éventuellement
`null` lorsqu'ils sont inconnus. La moyenne simple des notes valides est
calculée en amont et le composant ne la recalcule pas. Elle est distincte d'une
moyenne pondérée ; un genre sans note valide utilise l'état `empty` et n'est
pas affiché comme ayant une note de zéro. Une valeur manquante dans un résultat
`ready` est affichée comme indisponible.

### Contrat du widget « Meilleure note pondérée par genre »

Le composant reçoit un objet `BestWeightedRatedGenreWidgetData` défini dans
`MoviesTypes.ts`, avec `genre_name` et `average_weighted_rating`, éventuellement
`null` lorsqu'ils sont inconnus. La note pondérée est calculée en amont et le
composant affiche la valeur fournie sans lui appliquer une pondération. La
formule validée pour le calcul en amont est :

```text
score = (v / (v + m)) × R + (m / (v + m)) × C
```

`R` est la moyenne simple des notes valides du genre, `v` le nombre de films de
ce genre ayant une note valide, `C` la moyenne simple des notes valides de tout
le catalogue et `m = 50` le poids de référence (équivalent à 50 votes) dans la
pondération. `m` n'est pas un seuil minimal d'éligibilité. Un genre est
admissible uniquement si son nom est connu, `v > 0`, et si `R` et `C` peuvent
être calculés ; les genres non admissibles ne participent pas à la sélection.
Ces règles ne sont pas exécutées par le composant. Un genre sans note valide
utilise l'état `empty`, et une valeur absente dans un résultat `ready` est
affichée comme indisponible plutôt que comme zéro.

- `Dashboard/Film le plus rentable` et `Dashboard/Film le moins rentable`,
  qui montrent les cartes et leurs états.

### Contrat des widgets de rentabilité

Chaque composant reçoit un candidat déjà déterminé avec son `title`,
`release_year`, `poster_path` et `roi_percentage` (`number | null`), selon le
type `MovieProfitabilityWidgetData` de `MoviesTypes.ts`. Il ne calcule pas le
ROI et ne classe pas les films. `null` signifie que le ROI n'est pas connu et
s'affiche comme « Non renseigné », jamais comme zéro ; `0` est une valeur
valide affichée `0,00 %`. Les états `loading`, `empty` (aucun film éligible) et
`error` sont fournis explicitement. Les deux widgets appliquent le même
formatage et conservent le signe d'un ROI négatif.

La règle métier validée pour le calcul en amont des deux widgets est :

```text
ROI (%) = ((recettes - budget) / budget) × 100
```

Un film est éligible uniquement si son budget est strictement supérieur à zéro
et ses recettes sont supérieures ou égales à zéro. Un budget ou des recettes
manquants rendent le film inéligible. La carte ne met pas en œuvre ces règles ;
elles appartiennent à la future sélection/calcul des données.
`loading`, `empty`, `error` et `ready`.

- `Dashboard/TopRatedMovieWidget`, qui présente le film le mieux noté dans les
  états nominal, affiche absente, chargement, absence de film noté et erreur.
- `Dashboard/MostRepresentedCountryWidget`, qui présente le pays le plus
  représenté dans les états nominal, nom long, chargement, absence de pays et
  erreur.
- `Dashboard/AverageMovieRatingWidget`, qui présente la note moyenne avec les
  états nominal, chargement, absence de notes et erreur.
- `Dashboard/AverageMovieDurationWidget`, qui présente la durée moyenne dans
  les états nominal, chargement, absence de données et erreur.
- `Dashboard/MoviesInDatabaseWidget`, qui présente le widget « Films en base »
  dans les états `loading`, `empty`, `error` et `ready`.
  `loading`, `empty`, `error` et `ready` ;
- `Dashboard/Film le plus rentable`, qui montre la carte et ses états.

### Contrat du widget « Film le plus rentable »

Le composant reçoit un candidat déjà déterminé avec son `title`,
`release_year`, `poster_path` et `roi_percentage` (`number | null`). Il ne
calcule pas le ROI et ne classe pas les films. `null` signifie que la valeur
n'est pas connue et s'affiche comme « Non renseigné », jamais comme zéro. Les
états `loading`, `empty` (aucun film éligible) et `error` sont fournis
explicitement.

La règle métier validée pour le calcul en amont est :

```text
ROI (%) = ((recettes - budget) / budget) × 100
```

Un film est éligible uniquement si son budget est strictement supérieur à zéro
et ses recettes sont supérieures ou égales à zéro. Un budget ou des recettes
manquants rendent le film inéligible. La carte ne met pas en œuvre ces règles ;
elles appartiennent à la future sélection/calcul des données.

- `Dashboard/Genres représentés`, qui montre le total des genres distincts
  ainsi que les états zéro, valeur inconnue, chargement et erreur.

### Contrat du widget « Genres représentés »

Le composant reçoit un objet `GenresRepresentedWidgetData` défini dans
`MoviesTypes.ts`. Sa propriété `genre_count` contient le nombre de genres
distincts déjà calculé (`number`) ou `null` si le nombre est inconnu. Le widget
affiche ce total avec son unité ; il ne compte pas les associations entre films
et genres. Une valeur de zéro est un résultat valide et distinct d'une valeur
inconnue.

Pour produire une version statique et vérifier que toutes les stories sont
compilables :

```sh
npm run build-storybook
```

## Création de la base de données

Après l'installation des dépendances, créez et initialisez la base SQLite avec le CLI du backend :

```sh
npx tsx src/back-end/backend-cli.ts create-database
```

Par défaut, le fichier `data/movies.sqlite` est créé avec le schéma nécessaire. Pour choisir un autre emplacement, utilisez l'option `--path` :

```sh
npx tsx src/back-end/backend-cli.ts create-database --path ./data/ma-base.sqlite
```

La commande initialise le schéma sans supprimer les données d'une base existante.

## Import des films depuis un CSV

Le module
[`movies-importer.ts`](./src/back-end/database/movies-importer.ts) expose
`importMoviesFromCsv(database, filePath)`. Il lit un fichier CSV contenant les
colonnes de `data/movies.csv`, convertit les nombres et les valeurs vides, puis
insère ou met à jour chaque film selon son identifiant.

L'import renvoie le nombre de lignes traitées ainsi que les compteurs
`created` et `updated`. Il est exécuté dans une transaction SQLite : une ligne
invalide annule l'importation complète.

## Mise à jour du catalogue depuis TMDB

Le module
[`movies-update-service.ts`](./src/back-end/database/movies-update-service.ts)
expose `updateMoviesFromApi(database, options)`. Il récupère une page de films
populaires depuis TMDB, charge leurs détails, puis met à jour les films, genres,
pays de production et tables de liaison SQLite.

Les options `language`, `page` et `region` permettent de contrôler la page TMDB
à synchroniser. Le service renvoie les compteurs de films créés ou mis à jour,
ainsi que le nombre de genres et de pays traités.

## Module de gestion des films

Le module [`movies-repository.ts`](./src/back-end/database/movies-repository.ts)
gère les films stockés dans SQLite :

- `findMovieById(database, id)` recherche un film et renvoie `undefined` s'il
  n'existe pas ;
- `listMovies(database)` renvoie tous les films triés par identifiant croissant ;
- `createMovie(database, movie)` insère un film et renvoie la ligne persistée ;
- `updateMovie(database, movie)` actualise un film existant et renvoie `true`
  si une ligne a été modifiée, ou `false` si l'identifiant n'existe pas.

La colonne `release_year` est générée par SQLite à partir de `release_date`.
Lorsque `collected_at` n'est pas fourni lors d'une création ou d'une mise à
jour, le module utilise la date et l'heure courantes au format ISO.
Pour importer ou actualiser les pays depuis le fichier d'exemple :

```sh
npx tsx src/back-end/backend-cli.ts add-countries ./data/countries.csv
```

Le chemin de la base peut être personnalisé avec `--path` :

```sh
npx tsx src/back-end/backend-cli.ts --path ./data/ma-base.sqlite add-countries ./data/countries.csv
```

Pour supprimer uniquement les pays qui ne sont associés à aucun film :

```sh
npx tsx src/back-end/backend-cli.ts clean-countries
npx tsx src/back-end/backend-cli.ts --path ./data/ma-base.sqlite clean-countries
```

Pour importer ou mettre à jour les genres depuis le fichier [`data/genres.csv`](./data/genres.csv), utilisez :

```sh
npx tsx src/back-end/backend-cli.ts add-genres ./data/genres.csv
```

La synchronisation est idempotente : les genres existants sont mis à jour par identifiant
et les nouveaux genres sont ajoutés sans doublon. Le chemin de la base peut être placé
avant ou après la commande :

```sh
npx tsx src/back-end/backend-cli.ts --path ./data/ma-base.sqlite \
  add-genres ./data/genres.csv
```

Les opérations de lecture et d'écriture sur les genres sont regroupées dans
[`src/back-end/database/genre-repository.ts`](./src/back-end/database/genre-repository.ts).
Le dépôt valide le CSV avant l'ouverture de la base et gère les fins de ligne LF/CRLF,
le BOM UTF-8 ainsi que les champs CSV entre guillemets.

Pour supprimer uniquement les genres qui ne sont associés à aucun film, utilisez :

```sh
npx tsx src/back-end/backend-cli.ts clean-genres
npx tsx src/back-end/backend-cli.ts --path ./data/ma-base.sqlite clean-genres
```

Les commandes affichent le nombre de genres importés ou supprimés ainsi que le chemin de
la base utilisée.

## API locale

| Méthode | Route                  | Description                                                       |
| ------- | ---------------------- | ----------------------------------------------------------------- |
| `GET`   | `/api/health`          | Vérifie que le serveur répond.                                    |
| `GET`   | `/api/movies/popular`  | Renvoie les films populaires.                                     |
| `GET`   | `/api/movies/:id`      | Renvoie les détails du film correspondant à son identifiant TMDB. |
| `GET`   | `/api/discover/movies` | Renvoie une page de films pour une année de sortie principale.    |

Les routes des films acceptent les paramètres `language`, `page` et `region`. Exemple :

```text
/api/movies/popular?language=fr-FR&page=1&region=FR
```

La route Discover exige une année sur quatre chiffres entre 1000 et 9999.
Elle accepte aussi `language`, `page` et `region`, avec les valeurs par défaut
`fr-FR`, `1` et `FR` :

```text
/api/discover/movies?year=2020&language=en-US&page=2&region=US
```

Chaque appel récupère uniquement la page demandée depuis TMDB, sans enrichir ni
stocker les films.

## Vérifications

```sh
npm test          # Lance les tests avec la couverture
npm run test:verbose
npm run lint      # Vérifie le code
npm run fmt:check # Vérifie le formatage
```

La configuration de couverture des tests exige 100 % pour les instructions, branches, fonctions et lignes.
