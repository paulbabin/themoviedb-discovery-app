import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initializeSchema } from './schema';
import { updateMoviesFromApi } from './movies-update-service';

vi.mock('../utils/config', () => ({
  tmdbAccessToken: 'test-access-token',
}));

const movieSummary = {
  adult: false,
  backdrop_path: '/backdrop.jpg',
  genre_ids: [18],
  id: 1,
  original_language: 'en',
  original_title: 'Original title',
  overview: 'Overview',
  popularity: 12.5,
  poster_path: '/poster.jpg',
  release_date: '2024-01-02',
  title: 'Movie',
  video: false,
  vote_average: 7.5,
  vote_count: 100,
};

const movieDetails = {
  ...movieSummary,
  budget: 1000,
  genres: [{ id: 18, name: 'Drama' }],
  production_companies: [],
  production_countries: [{ iso_3166_1: 'FR', name: 'France' }],
  revenue: 2000,
  runtime: 120,
  tagline: null,
};

function createResponse(data: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

describe('movies update service', () => {
  let database: DatabaseSync;

  beforeEach(() => {
    database = new DatabaseSync(':memory:');
    initializeSchema(database);
  });

  afterEach(() => {
    database.close();
    vi.unstubAllGlobals();
  });

  it('updates movies and their genres, countries, and relationships from TMDB', async () => {
    // Arrange
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        createResponse({ page: 1, results: [movieSummary] }),
      )
      .mockResolvedValueOnce(createResponse(movieDetails));
    vi.stubGlobal('fetch', fetcher);

    // Act
    const result = await updateMoviesFromApi(database, {
      language: 'fr-FR',
      page: 2,
      region: 'FR',
    });

    // Assert
    expect(result).toEqual({
      movies: { created: 1, updated: 0 },
      genres: 1,
      countries: 1,
    });
    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      'https://api.themoviedb.org/3/movie/popular?language=fr-FR&page=2&region=FR',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-access-token',
        }),
      }),
    );
    expect(
      database.prepare('SELECT title, runtime_minutes FROM movies').all(),
    ).toEqual([{ title: 'Movie', runtime_minutes: 120 }]);
    expect(database.prepare('SELECT * FROM genres').all()).toEqual([
      { id: 18, name: 'Drama' },
    ]);
    expect(database.prepare('SELECT * FROM countries').all()).toEqual([
      { code: 'FR', name: 'France' },
    ]);
    expect(database.prepare('SELECT * FROM movie_genres').all()).toEqual([
      { movie_id: 1, genre_id: 18 },
    ]);
    expect(
      database.prepare('SELECT * FROM production_countries').all(),
    ).toEqual([{ movie_id: 1, country_code: 'FR' }]);
  });

  it('updates existing records and replaces stale relationships', async () => {
    // Arrange
    database
      .prepare(
        'INSERT INTO movies (id, title, original_title, original_language, overview, collected_at) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .run(1, 'Old movie', 'Old movie', 'en', 'Old overview', '2020-01-01');
    database.prepare('INSERT INTO genres VALUES (?, ?)').run(18, 'Old drama');
    database
      .prepare('INSERT INTO countries VALUES (?, ?)')
      .run('FR', 'Old France');
    database.prepare('INSERT INTO movie_genres VALUES (?, ?)').run(1, 18);
    database
      .prepare('INSERT INTO production_countries VALUES (?, ?)')
      .run(1, 'FR');
    const updatedDetails = {
      ...movieDetails,
      budget: 0,
      genres: [{ id: 35, name: 'Comedy' }],
      production_countries: [{ iso_3166_1: 'US', name: 'United States' }],
      release_date: '',
      revenue: 0,
      title: 'Updated movie',
    };
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        createResponse({ page: 1, results: [movieSummary] }),
      )
      .mockResolvedValueOnce(createResponse(updatedDetails));

    // Act
    const result = await updateMoviesFromApi(database, { fetcher });

    // Assert
    expect(result.movies).toEqual({ created: 0, updated: 1 });
    expect(database.prepare('SELECT title FROM movies').get()).toEqual({
      title: 'Updated movie',
    });
    expect(database.prepare('SELECT * FROM movie_genres').all()).toEqual([
      { movie_id: 1, genre_id: 35 },
    ]);
    expect(
      database.prepare('SELECT * FROM production_countries').all(),
    ).toEqual([{ movie_id: 1, country_code: 'US' }]);
  });

  it('reports API failures explicitly', async () => {
    // Arrange
    const fetcher = vi.fn().mockResolvedValue(createResponse({}, false, 503));

    // Act and Assert
    await expect(updateMoviesFromApi(database, { fetcher })).rejects.toThrow(
      'TMDB API request failed for popular movies with status 503',
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
