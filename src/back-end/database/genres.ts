import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';

export type Genre = {
  id: number;
  name: string;
};

export const DEFAULT_GENRES_CSV_PATH = resolve('data/genres.csv');

function parseGenreId(value: string, lineNumber: number): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error(`Invalid genre id on CSV line ${lineNumber}: "${value}"`);
  }
  return id;
}

export function parseGenresCsv(csv: string): Genre[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0 || lines[0] !== 'id,name') {
    throw new Error('Genres CSV must start with the "id,name" header.');
  }

  const genres: Genre[] = [];
  const ids = new Set<number>();

  for (const [index, line] of lines.slice(1).entries()) {
    const lineNumber = index + 2;
    const fields = line.split(',');
    if (fields.length !== 2) {
      throw new Error(`Invalid genres CSV line ${lineNumber}: "${line}"`);
    }

    const id = parseGenreId(fields[0].trim(), lineNumber);
    const name = fields[1].trim();
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

export function upsertGenres(database: DatabaseSync, genres: Genre[]): number {
  const statement = database.prepare(`
    INSERT INTO genres (id, name)
    VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name
  `);

  database.exec('BEGIN TRANSACTION;');
  try {
    for (const genre of genres) {
      statement.run(genre.id, genre.name);
    }
    database.exec('COMMIT;');
  } catch (error) {
    database.exec('ROLLBACK;');
    throw error;
  }

  return genres.length;
}

export function syncGenresFromCsv(
  database: DatabaseSync,
  csvPath = DEFAULT_GENRES_CSV_PATH,
): number {
  const genres = parseGenresCsv(readFileSync(csvPath, 'utf8'));
  return upsertGenres(database, genres);
}
