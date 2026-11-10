import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { parse } from 'csv-parse/sync';

export type Genre = {
  id: number;
  name: string;
};

export const DEFAULT_GENRES_CSV_PATH = resolve('data/genres.csv');

export function findGenreById(
  database: DatabaseSync,
  id: number,
): Genre | undefined {
  return database
    .prepare('SELECT id, name FROM genres WHERE id = ?')
    .get(id) as Genre | undefined;
}

export function listGenres(database: DatabaseSync): Genre[] {
  return database
    .prepare('SELECT id, name FROM genres ORDER BY id ASC')
    .all() as Genre[];
}

export function upsertGenres(
  database: DatabaseSync,
  genres: Iterable<Genre>,
): number {
  const entries = Array.from(genres);
  if (entries.length === 0) {
    return 0;
  }

  const statement = database.prepare(`
    INSERT INTO genres (id, name)
    VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name
  `);

  database.exec('BEGIN TRANSACTION;');
  try {
    for (const genre of entries) {
      statement.run(genre.id, genre.name);
    }
    database.exec('COMMIT;');
  } catch (error) {
    database.exec('ROLLBACK;');
    throw error;
  }

  return entries.length;
}

function parseGenreId(value: string, lineNumber: number): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error(`Invalid genre id on CSV line ${lineNumber}: "${value}"`);
  }
  return id;
}

export function parseGenresCsv(csv: string): Genre[] {
  let records: Array<Record<string, string>>;
  try {
    records = parse(csv, {
      bom: true,
      columns: (headers: string[]) => {
        const normalizedHeaders = headers.map((header) =>
          header.trim().toLowerCase(),
        );
        if (
          normalizedHeaders.length !== 2 ||
          !normalizedHeaders.includes('id') ||
          !normalizedHeaders.includes('name')
        ) {
          throw new Error(
            'Genres CSV headers must be exactly "id" and "name".',
          );
        }
        return normalizedHeaders;
      },
      skip_empty_lines: true,
      trim: true,
    }) as Array<Record<string, string>>;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Genres CSV')) {
      throw error;
    }
    throw new Error(
      `Invalid genres CSV: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }

  const genres: Genre[] = [];
  const ids = new Set<number>();

  for (const [index, record] of records.entries()) {
    const lineNumber = index + 2;
    const id = parseGenreId(record.id, lineNumber);
    const name = record.name;
    if (name.length === 0) {
      throw new Error(`Genre name cannot be empty on CSV line ${lineNumber}.`);
    }
    if (ids.has(id)) {
      throw new Error(`Duplicate genre id on CSV line ${lineNumber}: ${id}`);
    }

    ids.add(id);
    genres.push({ id, name });
  }

  return genres;
}

export function syncGenresFromCsv(
  database: DatabaseSync,
  csvPath = DEFAULT_GENRES_CSV_PATH,
): number {
  return upsertGenres(database, readGenresCsv(csvPath));
}

export function readGenresCsv(csvPath: string): Genre[] {
  return parseGenresCsv(readFileSync(csvPath, 'utf8'));
}

export function cleanUnusedGenres(database: DatabaseSync): number {
  const result = database
    .prepare(`
      DELETE FROM genres
      WHERE NOT EXISTS (
        SELECT 1
        FROM movie_genres
        WHERE movie_genres.genre_id = genres.id
      )
    `)
    .run();
  return Number(result.changes);
}
