import type { DatabaseSync } from 'node:sqlite';
import type { Country } from '../types/Country';

export function findCountryByCode(
  database: DatabaseSync,
  code: string,
): Country | undefined {
  return database
    .prepare('SELECT code, name FROM countries WHERE code = ?')
    .get(code) as Country | undefined;
}

export function listCountries(database: DatabaseSync): Country[] {
  return database
    .prepare('SELECT code, name FROM countries ORDER BY code ASC')
    .all() as Country[];
}

export function upsertCountries(
  database: DatabaseSync,
  countries: Iterable<Country>,
): number {
  const entries = Array.from(countries);
  if (entries.length === 0) {
    return 0;
  }

  const statement = database.prepare(`
    INSERT INTO countries (code, name)
    VALUES (?, ?)
    ON CONFLICT(code) DO UPDATE SET name = excluded.name
  `);

  database.exec('BEGIN TRANSACTION;');
  try {
    for (const country of entries) {
      statement.run(country.code, country.name);
    }
    database.exec('COMMIT;');
  } catch (error) {
    database.exec('ROLLBACK;');
    throw error;
  }

  return entries.length;
}
