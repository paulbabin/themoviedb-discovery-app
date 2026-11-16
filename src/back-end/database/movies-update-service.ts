import type { DatabaseSync } from 'node:sqlite';
import { tmdbAccessToken } from '../utils/config';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_PAGE,
  DEFAULT_REGION,
} from '../utils/constants';
import { createMovie, findMovieById, updateMovie } from './movies-repository';
import { upsertCountries } from './country-repository';
import { upsertGenres } from './genre-repository';
import type {
  MovieInput,
  MovieUpdateResult,
  TmdbMovieDetails,
  TmdbMoviesRawResponse,
} from '../types/MoviesTypes';

export type MovieUpdateOptions = {
  language?: string;
  page?: number;
  region?: string;
  fetcher?: typeof fetch;
};

function createApiHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${tmdbAccessToken}`,
    'Content-Type': 'application/json;charset=utf-8',
  };
}

async function fetchJson(
  fetcher: typeof fetch,
  url: string,
  resource: string,
): Promise<unknown> {
  const response = await fetcher(url, { headers: createApiHeaders() });
  if (!response.ok) {
    throw new Error(
      `TMDB API request failed for ${resource} with status ${response.status}`,
    );
  }
  return response.json();
}

function toMovieInput(movie: TmdbMovieDetails): MovieInput {
  return {
    id: movie.id,
    title: movie.title,
    original_title: movie.original_title,
    original_language: movie.original_language,
    overview: movie.overview,
    release_date: movie.release_date || null,
    popularity: movie.popularity,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    runtime_minutes: movie.runtime,
    budget: movie.budget > 0 ? movie.budget : null,
    revenue: movie.revenue > 0 ? movie.revenue : null,
  };
}

function synchronizeMovieRelations(
  database: DatabaseSync,
  movie: TmdbMovieDetails,
): void {
  database.prepare('DELETE FROM movie_genres WHERE movie_id = ?').run(movie.id);
  const genreStatement = database.prepare(
    'INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?)',
  );
  for (const genre of movie.genres) {
    genreStatement.run(movie.id, genre.id);
  }

  database
    .prepare('DELETE FROM production_countries WHERE movie_id = ?')
    .run(movie.id);
  const countryStatement = database.prepare(
    'INSERT INTO production_countries (movie_id, country_code) VALUES (?, ?)',
  );
  for (const country of movie.production_countries) {
    countryStatement.run(movie.id, country.iso_3166_1);
  }
}

function persistMovie(
  database: DatabaseSync,
  movie: TmdbMovieDetails,
): 'created' | 'updated' {
  const movieInput = toMovieInput(movie);
  const existingMovie = findMovieById(database, movie.id);

  if (existingMovie) {
    updateMovie(database, movieInput);
  } else {
    createMovie(database, movieInput);
  }

  upsertGenres(database, movie.genres);
  upsertCountries(
    database,
    movie.production_countries.map((country) => ({
      code: country.iso_3166_1,
      name: country.name,
    })),
  );
  synchronizeMovieRelations(database, movie);

  return existingMovie ? 'updated' : 'created';
}

/**
 * Updates local movies, genres, countries, and their relationships from TMDB.
 */
export async function updateMoviesFromApi(
  database: DatabaseSync,
  options: MovieUpdateOptions = {},
): Promise<MovieUpdateResult> {
  const language = options.language ?? DEFAULT_LANGUAGE;
  const page = options.page ?? DEFAULT_PAGE;
  const region = options.region ?? DEFAULT_REGION;
  const fetcher = options.fetcher ?? globalThis.fetch;
  const query = new URLSearchParams({
    language,
    page: String(page),
    region,
  });
  const popularUrl = `https://api.themoviedb.org/3/movie/popular?${query.toString()}`;
  const popularResponse = (await fetchJson(
    fetcher,
    popularUrl,
    'popular movies',
  )) as TmdbMoviesRawResponse;

  const result: MovieUpdateResult = {
    movies: { created: 0, updated: 0 },
    genres: 0,
    countries: 0,
  };

  for (const movie of popularResponse.results) {
    const detailsQuery = new URLSearchParams({ language });
    const detailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}?${detailsQuery.toString()}`;
    const details = (await fetchJson(
      fetcher,
      detailsUrl,
      `movie ${movie.id}`,
    )) as TmdbMovieDetails;
    const operation = persistMovie(database, details);
    result.movies[operation] += 1;
    result.genres += details.genres.length;
    result.countries += details.production_countries.length;
  }

  return result;
}
