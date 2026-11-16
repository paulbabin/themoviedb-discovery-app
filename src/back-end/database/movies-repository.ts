import type { DatabaseSync } from 'node:sqlite';

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

export type MovieInput = Omit<MovieRecord, 'release_year' | 'collected_at'> & {
  collected_at?: string;
};

const movieColumns = `
  id,
  title,
  original_title,
  original_language,
  overview,
  release_date,
  release_year,
  popularity,
  vote_average,
  vote_count,
  poster_path,
  backdrop_path,
  runtime_minutes,
  budget,
  revenue,
  collected_at
`;

function toMovieRecord(row: Record<string, unknown>): MovieRecord {
  return row as unknown as MovieRecord;
}

/**
 * Finds one movie by its identifier.
 */
export function findMovieById(
  database: DatabaseSync,
  id: number,
): MovieRecord | undefined {
  const row = database
    .prepare(`SELECT ${movieColumns} FROM movies WHERE id = ?`)
    .get(id) as Record<string, unknown> | undefined;

  return row ? toMovieRecord(row) : undefined;
}

/**
 * Lists all movies ordered by their identifier.
 */
export function listMovies(database: DatabaseSync): MovieRecord[] {
  const rows = database
    .prepare(`SELECT ${movieColumns} FROM movies ORDER BY id ASC`)
    .all() as Record<string, unknown>[];

  return rows.map(toMovieRecord);
}

/**
 * Inserts a movie and returns the persisted record.
 */
export function createMovie(
  database: DatabaseSync,
  movie: MovieInput,
): MovieRecord {
  const collectedAt = movie.collected_at ?? new Date().toISOString();
  const row = database
    .prepare(
      `INSERT INTO movies (
        id,
        title,
        original_title,
        original_language,
        overview,
        release_date,
        popularity,
        vote_average,
        vote_count,
        poster_path,
        backdrop_path,
        runtime_minutes,
        budget,
        revenue,
        collected_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING ${movieColumns}`,
    )
    .get(
      movie.id,
      movie.title,
      movie.original_title,
      movie.original_language,
      movie.overview,
      movie.release_date,
      movie.popularity,
      movie.vote_average,
      movie.vote_count,
      movie.poster_path,
      movie.backdrop_path,
      movie.runtime_minutes,
      movie.budget,
      movie.revenue,
      collectedAt,
    );

  return toMovieRecord(row as Record<string, unknown>);
}

/**
 * Updates an existing movie and returns whether a row was changed.
 */
export function updateMovie(
  database: DatabaseSync,
  movie: MovieInput,
): boolean {
  const result = database
    .prepare(
      `UPDATE movies SET
        title = ?,
        original_title = ?,
        original_language = ?,
        overview = ?,
        release_date = ?,
        popularity = ?,
        vote_average = ?,
        vote_count = ?,
        poster_path = ?,
        backdrop_path = ?,
        runtime_minutes = ?,
        budget = ?,
        revenue = ?,
        collected_at = ?
      WHERE id = ?`,
    )
    .run(
      movie.title,
      movie.original_title,
      movie.original_language,
      movie.overview,
      movie.release_date,
      movie.popularity,
      movie.vote_average,
      movie.vote_count,
      movie.poster_path,
      movie.backdrop_path,
      movie.runtime_minutes,
      movie.budget,
      movie.revenue,
      movie.collected_at ?? new Date().toISOString(),
      movie.id,
    );

  return result.changes > 0;
}
