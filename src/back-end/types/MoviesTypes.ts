// TypeScript type for the raw response from the TMDB API for popular movies.
export type TmdbMoviesRawResponse = {
  page: number;
  results: Array<TmdbMovie & { video?: boolean }>;
  total_pages: number;
  total_results: number;
};

// TypeScript type for the raw response from the TMDB API for popular movies.
export type TmdbMovie = {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

export type TmdbMovieDetails = {
  adult: boolean;
  backdrop_path: string | null;
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  genres: TmdbGenre[];
  production_countries: TmdbProductionCountry[];
  runtime: number | null;
  budget: number;
  revenue: number;
  tagline: string | null;
  production_companies: Array<{
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }>;
};

export type TmdbGenre = {
  id: number;
  name: string;
};

export type TmdbProductionCountry = {
  iso_3166_1: string;
  name: string;
};

// TypeScript type for the API response when fetching movies, containing an array of supported Movie objects.
export type MoviesApiResponse = {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
};

// TypeScript type for the supported movie format used in our application, omitting 'adult' and 'video' properties from the TmdbMovie type.
export type Movie = Omit<TmdbMovie, 'adult' | 'video'>;

// TypeScript type for the supported movie details format used in our application, omitting 'adult','video' and production_companies properties from the TmdbMovieDetails type.
export type MovieDetails = Omit<
  TmdbMovieDetails,
  'adult' | 'video' | 'production_companies'
>;

// TypeScript type for the API response when fetching popular movies, containing an array of supported Movie objects.
export type ApiErrorResponse = {
  error: string;
};

// Type for a row read from the movies CSV file before conversion.
export type MovieCsvRow = {
  id: string;
  title: string;
  original_title: string;
  original_language: string;
  overview: string;
  release_date: string;
  popularity: string;
  vote_average: string;
  vote_count: string;
  poster_path: string;
  backdrop_path: string;
  runtime: string;
  budget: string;
  revenue: string;
  genres: string;
  production_countries: string;
};

// Type for the result returned after importing a movies CSV file.
export type MovieImportResult = {
  imported: number;
  created: number;
  updated: number;
};

export type MovieUpdateResult = {
  movies: {
    created: number;
    updated: number;
  };
  genres: number;
  countries: number;
};

// Type for a movie persisted in the SQLite database.
export type MovieRecord = {
  id: number;
  title: string;
  original_title: string;
  original_language: string;
  overview: string;
  release_date: string | null;
  release_year: number | null;
  popularity: number | null;
  vote_average: number | null;
  vote_count: number | null;
  poster_path: string | null;
  backdrop_path: string | null;
  runtime_minutes: number | null;
  budget: number | null;
  revenue: number | null;
  collected_at: string;
};

export type GenresRepresentedWidgetData = {
  genre_count: number | null;
};

export type DominantGenreWidgetData = {
  genre_name: string | null;
  movie_count: number | null;
};

export type MovieProfitabilityWidgetData = Pick<
  MovieRecord,
  'title' | 'release_year' | 'poster_path'
> & {
  roi_percentage: number | null;
};

export type MostProfitableMovieWidgetData = MovieProfitabilityWidgetData;

export type LeastProfitableMovieWidgetData = MovieProfitabilityWidgetData;

// Type for movie data accepted when creating or updating a database record.
export type MovieInput = Omit<MovieRecord, 'release_year' | 'collected_at'> & {
  collected_at?: string;
};
