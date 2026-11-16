import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initializeSchema } from './schema';
import {
  createMovie,
  findMovieById,
  listMovies,
  updateMovie,
  type MovieInput,
} from './movies-repository';

const baseMovie: MovieInput = {
  id: 20,
  title: 'A movie',
  original_title: 'A movie',
  original_language: 'en',
  overview: 'An overview',
  release_date: '2020-05-10',
  popularity: 12.5,
  vote_average: 7.2,
  vote_count: 100,
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  runtime_minutes: 120,
  budget: 1000,
  revenue: 2000,
  collected_at: '2026-01-01T00:00:00.000Z',
};

describe('movies repository', () => {
  let database: DatabaseSync;

  beforeEach(() => {
    database = new DatabaseSync(':memory:');
    initializeSchema(database);
  });

  afterEach(() => {
    database.close();
  });

  it('creates a movie and finds it by identifier', () => {
    // Arrange
    const movie = { ...baseMovie };

    // Act
    const createdMovie = createMovie(database, movie);
    const foundMovie = findMovieById(database, movie.id);

    // Assert
    expect(createdMovie).toEqual({
      ...movie,
      release_year: 2020,
    });
    expect(foundMovie).toEqual(createdMovie);
  });

  it('lists movies in ascending identifier order', () => {
    // Arrange
    createMovie(database, { ...baseMovie, id: 30 });
    createMovie(database, { ...baseMovie, id: 10 });

    // Act
    const movies = listMovies(database);

    // Assert
    expect(movies.map((movie) => movie.id)).toEqual([10, 30]);
  });

  it('updates an existing movie and recalculates its generated release year', () => {
    // Arrange
    createMovie(database, baseMovie);
    const updatedMovie = {
      ...baseMovie,
      title: 'Updated movie',
      release_date: '2024-08-20',
    };

    // Act
    const wasUpdated = updateMovie(database, updatedMovie);

    // Assert
    expect(wasUpdated).toBe(true);
    expect(findMovieById(database, baseMovie.id)).toMatchObject({
      title: 'Updated movie',
      release_date: '2024-08-20',
      release_year: 2024,
    });
  });

  it('reports when updating a movie that does not exist', () => {
    // Act
    const wasUpdated = updateMovie(database, baseMovie);

    // Assert
    expect(wasUpdated).toBe(false);
  });

  it('generates the collection timestamp when it is omitted', () => {
    // Arrange
    const { collected_at: _collectedAt, ...movieWithoutTimestamp } = baseMovie;

    // Act
    const createdMovie = createMovie(database, movieWithoutTimestamp);

    // Assert
    expect(createdMovie.collected_at).toEqual(expect.any(String));
  });
});
