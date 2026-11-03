import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { parseGenresCsv, syncGenresFromCsv, upsertGenres } from './genres';

describe('genres database operations', () => {
  it('parses the genre CSV format', () => {
    expect(parseGenresCsv('id,name\n28,Action\n18,Drama\n')).toEqual([
      { id: 28, name: 'Action' },
      { id: 18, name: 'Drama' },
    ]);
  });

  it('rejects malformed or duplicate CSV entries', () => {
    expect(() => parseGenresCsv('name,id\n28,Action')).toThrow(
      /"id,name" header/,
    );
    expect(() => parseGenresCsv('id,name\n0,Action')).toThrow(
      /Invalid genre id/,
    );
    expect(() => parseGenresCsv('id,name\n28,Action,Extra')).toThrow(
      /Invalid genres CSV line/,
    );
    expect(() => parseGenresCsv('id,name\n28,')).toThrow(/cannot be empty/);
    expect(() => parseGenresCsv('id,name\n28,Action\n28,Drama')).toThrow(
      /Duplicate genre id/,
    );
  });

  it('creates genres and updates existing names without deleting other genres', () => {
    const database = new DatabaseSync(':memory:');
    database.exec(`
      CREATE TABLE genres (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
      );
    `);
    database.prepare('INSERT INTO genres VALUES (?, ?)').run(18, 'Old name');

    expect(
      upsertGenres(database, [
        { id: 18, name: 'Drama' },
        { id: 28, name: 'Action' },
      ]),
    ).toBe(2);
    expect(database.prepare('SELECT * FROM genres ORDER BY id').all()).toEqual([
      { id: 18, name: 'Drama' },
      { id: 28, name: 'Action' },
    ]);
    database.close();
  });

  it('rolls back all changes when an upsert fails', () => {
    const database = new DatabaseSync(':memory:');
    database.exec(`
      CREATE TABLE genres (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );
    `);

    expect(() =>
      upsertGenres(database, [
        { id: 18, name: 'Drama' },
        { id: 28, name: 'Drama' },
      ]),
    ).toThrow(/UNIQUE constraint failed/);
    expect(database.prepare('SELECT * FROM genres').all()).toEqual([]);
    database.close();
  });

  it('loads genres from a CSV file into the database', () => {
    const database = new DatabaseSync(':memory:');
    database.exec(
      'CREATE TABLE genres (id INTEGER PRIMARY KEY, name TEXT NOT NULL);',
    );

    expect(syncGenresFromCsv(database, 'data/genres.csv')).toBe(19);
    expect(
      database.prepare('SELECT COUNT(*) AS count FROM genres').get(),
    ).toEqual({ count: 19 });
    database.close();
  });
});
