import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import {
  findCountryByCode,
  listCountries,
  upsertCountries,
  type Country,
} from './country-repository';

function createDatabase(): DatabaseSync {
  const database = new DatabaseSync(':memory:');
  database.exec(`
    CREATE TABLE countries (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);
  return database;
}

describe('country repository', () => {
  it('finds an existing country and returns undefined for an unknown code', () => {
    // Arrange
    const database = createDatabase();
    database.prepare('INSERT INTO countries VALUES (?, ?)').run('FR', 'France');

    // Act
    const existingCountry = findCountryByCode(database, 'FR');
    const missingCountry = findCountryByCode(database, 'DE');

    // Assert
    expect(existingCountry).toEqual({ code: 'FR', name: 'France' });
    expect(missingCountry).toBeUndefined();
    database.close();
  });

  it('lists an empty database and sorts countries by code', () => {
    // Arrange
    const database = createDatabase();

    // Act
    const emptyCountries = listCountries(database);
    database
      .prepare('INSERT INTO countries VALUES (?, ?)')
      .run('US', 'United States of America');
    database.prepare('INSERT INTO countries VALUES (?, ?)').run('FR', 'France');
    const sortedCountries = listCountries(database);

    // Assert
    expect(emptyCountries).toEqual([]);
    expect(sortedCountries).toEqual([
      { code: 'FR', name: 'France' },
      { code: 'US', name: 'United States of America' },
    ]);
    database.close();
  });

  it('inserts and updates countries from an array without duplicates', () => {
    // Arrange
    const database = createDatabase();
    database
      .prepare('INSERT INTO countries VALUES (?, ?)')
      .run('FR', 'Old name');

    // Act
    const count = upsertCountries(database, [
      { code: 'FR', name: 'France' },
      { code: 'GB', name: 'United Kingdom' },
    ]);

    // Assert
    expect(count).toBe(2);
    expect(listCountries(database)).toEqual([
      { code: 'FR', name: 'France' },
      { code: 'GB', name: 'United Kingdom' },
    ]);
    database.close();
  });

  it('accepts other iterables and keeps the last name for repeated codes', () => {
    // Arrange
    const database = createDatabase();
    function* countries(): Generator<Country> {
      yield { code: 'FR', name: 'France' };
      yield { code: 'FR', name: 'French Republic' };
    }

    // Act
    const count = upsertCountries(database, countries());

    // Assert
    expect(count).toBe(2);
    expect(findCountryByCode(database, 'FR')).toEqual({
      code: 'FR',
      name: 'French Republic',
    });
    expect(listCountries(database)).toHaveLength(1);
    database.close();
  });

  it('does not modify data for an empty iterable', () => {
    // Arrange
    const database = createDatabase();
    database.prepare('INSERT INTO countries VALUES (?, ?)').run('FR', 'France');

    // Act
    const count = upsertCountries(database, new Set<Country>());

    // Assert
    expect(count).toBe(0);
    expect(listCountries(database)).toEqual([{ code: 'FR', name: 'France' }]);
    database.close();
  });

  it('rolls back all changes when a country cannot be stored', () => {
    // Arrange
    const database = createDatabase();
    const countries = [
      { code: 'FR', name: 'France' },
      { code: 'GB', name: null as unknown as string },
    ];

    // Act
    expect(() => upsertCountries(database, countries)).toThrow(
      /NOT NULL constraint failed/,
    );

    // Assert
    expect(listCountries(database)).toEqual([]);
    database.close();
  });
});
