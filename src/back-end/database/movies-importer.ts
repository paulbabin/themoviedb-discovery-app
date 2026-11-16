import { readFileSync } from 'node:fs';
import type { DatabaseSync } from 'node:sqlite';
import type { MovieCsvRow, MovieImportResult } from '../types/MoviesTypes';

const expectedHeaders: Array<keyof MovieCsvRow> = [
  'id',
  'title',
  'original_title',
  'original_language',
  'overview',
  'release_date',
  'popularity',
  'vote_average',
  'vote_count',
  'poster_path',
  'backdrop_path',
  'runtime',
  'budget',
  'revenue',
  'genres',
  'production_countries',
];

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === '"' && quoted && nextCharacter === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && nextCharacter === '\n') {
        index += 1;
      }
      row.push(field);
      if (row.some((value) => value !== '')) {
        rows.push(row);
      }
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    if (row.some((value) => value !== '')) {
      rows.push(row);
    }
  }

  if (quoted) {
    throw new Error('Invalid CSV: unterminated quoted field');
  }

  return rows;
}

function parseNullableNumber(value: string, field: string): number | null {
  if (value === '') {
    return null;
  }

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) {
    throw new Error(`Invalid ${field} value: ${value}`);
  }
  return parsedValue;
}

function parseRequiredNumber(value: string, field: string): number {
  const parsedValue = parseNullableNumber(value, field);
  if (parsedValue === null) {
    throw new Error(`Missing ${field} value`);
  }
  return parsedValue;
}

function toMovieCsvRow(values: string[], line: number): MovieCsvRow {
  if (values.length !== expectedHeaders.length) {
    throw new Error(
      `Invalid CSV row at line ${line}: expected ${expectedHeaders.length} columns`,
    );
  }

  return Object.fromEntries(
    expectedHeaders.map((header, index) => [header, values[index]]),
  ) as MovieCsvRow;
}

function upsertMovie(
  database: DatabaseSync,
  row: MovieCsvRow,
  collectedAt: string,
): 'created' | 'updated' {
  const id = parseRequiredNumber(row.id, 'id');
  const existingMovie = database
    .prepare('SELECT id FROM movies WHERE id = ?')
    .get(id);

  database
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
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        original_title = excluded.original_title,
        original_language = excluded.original_language,
        overview = excluded.overview,
        release_date = excluded.release_date,
        popularity = excluded.popularity,
        vote_average = excluded.vote_average,
        vote_count = excluded.vote_count,
        poster_path = excluded.poster_path,
        backdrop_path = excluded.backdrop_path,
        runtime_minutes = excluded.runtime_minutes,
        budget = excluded.budget,
        revenue = excluded.revenue,
        collected_at = excluded.collected_at`,
    )
    .run(
      id,
      row.title,
      row.original_title,
      row.original_language,
      row.overview,
      row.release_date || null,
      parseNullableNumber(row.popularity, 'popularity'),
      parseNullableNumber(row.vote_average, 'vote_average'),
      parseNullableNumber(row.vote_count, 'vote_count'),
      row.poster_path || null,
      row.backdrop_path || null,
      parseNullableNumber(row.runtime, 'runtime'),
      parseNullableNumber(row.budget, 'budget'),
      parseNullableNumber(row.revenue, 'revenue'),
      collectedAt,
    );

  return existingMovie ? 'updated' : 'created';
}

/**
 * Imports movies from a CSV file and inserts or updates them by identifier.
 */
export function importMoviesFromCsv(
  database: DatabaseSync,
  filePath: string,
): MovieImportResult {
  const rows = parseCsv(readFileSync(filePath, 'utf8'));
  const [headers, ...dataRows] = rows;

  if (
    !headers ||
    headers.length !== expectedHeaders.length ||
    headers.some((header, index) => header !== expectedHeaders[index])
  ) {
    throw new Error('Invalid movies CSV header');
  }

  const collectedAt = new Date().toISOString();
  const result: MovieImportResult = {
    imported: 0,
    created: 0,
    updated: 0,
  };

  database.exec('BEGIN TRANSACTION');
  try {
    dataRows.forEach((values, index) => {
      const operation = upsertMovie(
        database,
        toMovieCsvRow(values, index + 2),
        collectedAt,
      );
      result[operation] += 1;
      result.imported += 1;
    });
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }

  return result;
}
