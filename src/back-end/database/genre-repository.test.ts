import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import {
  cleanUnusedGenres,
  findGenreById,
  listGenres,
  parseGenresCsv,
  syncGenresFromCsv,
  upsertGenres,
  type Genre,
} from './genre-repository';

function createDatabase(): DatabaseSync {
  const database = new DatabaseSync(':memory:');
  database.exec(`
    CREATE TABLE genres (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);
  return database;
}

describe('genre repository', () => {
  it('finds an existing genre and returns undefined for an unknown id', () => {
    const database = createDatabase();
    database.prepare('INSERT INTO genres VALUES (?, ?)').run(18, 'Drama');

    expect(findGenreById(database, 18)).toEqual({ id: 18, name: 'Drama' });
    expect(findGenreById(database, 28)).toBeUndefined();
    database.close();
  });

  it('lists genres in ascending identifier order', () => {
    const database = createDatabase();
    database.prepare('INSERT INTO genres VALUES (?, ?)').run(35, 'Comedy');
    database.prepare('INSERT INTO genres VALUES (?, ?)').run(18, 'Drama');

    expect(listGenres(database)).toEqual([
      { id: 18, name: 'Drama' },
      { id: 35, name: 'Comedy' },
    ]);
    database.close();
  });

  it('inserts and updates genres from arrays without creating duplicates', () => {
    const database = createDatabase();
    database.prepare('INSERT INTO genres VALUES (?, ?)').run(18, 'Old name');

    expect(
      upsertGenres(database, [
        { id: 18, name: 'Drama' },
        { id: 28, name: 'Action' },
      ]),
    ).toBe(2);
    expect(listGenres(database)).toEqual([
      { id: 18, name: 'Drama' },
      { id: 28, name: 'Action' },
    ]);
    database.close();
  });

  it('accepts generators and keeps the last label for repeated identifiers', () => {
    const database = createDatabase();
    function* genres(): Generator<Genre> {
      yield { id: 18, name: 'Drama' };
      yield { id: 18, name: 'Drama updated' };
    }

    expect(upsertGenres(database, genres())).toBe(2);
    expect(findGenreById(database, 18)).toEqual({
      id: 18,
      name: 'Drama updated',
    });
    expect(listGenres(database)).toHaveLength(1);
    database.close();
  });

  it('does not modify data for an empty iterable', () => {
    const database = createDatabase();
    database.prepare('INSERT INTO genres VALUES (?, ?)').run(18, 'Drama');

    expect(upsertGenres(database, new Set<Genre>())).toBe(0);
    expect(listGenres(database)).toEqual([{ id: 18, name: 'Drama' }]);
    database.close();
  });

  it('enforces the required genre name', () => {
    const database = createDatabase();

    expect(() =>
      upsertGenres(database, [{ id: 18, name: null as unknown as string }]),
    ).toThrow(/NOT NULL constraint failed/);
    expect(listGenres(database)).toEqual([]);
    database.close();
  });

  it('parses the genre CSV format', () => {
    expect(
      parseGenresCsv(
        '\uFEFFNAME,ID\r\n"Science, Fiction",878\r\n"Drama ""classic""",18\r\n',
      ),
    ).toEqual([
      { id: 878, name: 'Science, Fiction' },
      { id: 18, name: 'Drama "classic"' },
    ]);
    expect(parseGenresCsv('id,name\n\n28,Action\n\n')).toEqual([
      { id: 28, name: 'Action' },
    ]);
  });

  it('rejects malformed or duplicate CSV entries', () => {
    expect(() => parseGenresCsv('name,slug\n28,Action')).toThrow(
      /headers must be exactly/,
    );
    expect(() => parseGenresCsv('id,id\n28,Action')).toThrow(
      /headers must be exactly/,
    );
    expect(() => parseGenresCsv('id,name\n0,Action')).toThrow(
      /Invalid genre id/,
    );
    expect(() => parseGenresCsv('id,name\n28')).toThrow(/Invalid genres CSV/);
    expect(() => parseGenresCsv('id,name\n28,')).toThrow(/cannot be empty/);
    expect(() => parseGenresCsv('id,name\n28,Action\n28,Drama')).toThrow(
      /Duplicate genre id/,
    );
    expect(() => parseGenresCsv('id,name\n1,"unterminated')).toThrow(
      /Invalid genres CSV/,
    );
  });

  it('loads genres from a CSV file into the database', () => {
    const database = createDatabase();

    expect(syncGenresFromCsv(database, 'data/genres.csv')).toBe(19);
    expect(listGenres(database)).toHaveLength(19);
    database.close();
  });

  it('removes only genres that are not associated with a movie', () => {
    const database = createDatabase();
    database.exec(`
      CREATE TABLE movies (id INTEGER PRIMARY KEY);
      CREATE TABLE movie_genres (
        movie_id INTEGER NOT NULL,
        genre_id INTEGER NOT NULL
      );
    `);
    database
      .prepare('INSERT INTO genres VALUES (?, ?), (?, ?)')
      .run(18, 'Drama', 28, 'Action');
    database.prepare('INSERT INTO movies VALUES (?)').run(1);
    database.prepare('INSERT INTO movie_genres VALUES (?, ?)').run(1, 18);

    expect(cleanUnusedGenres(database)).toBe(1);
    expect(listGenres(database)).toEqual([{ id: 18, name: 'Drama' }]);
    database.close();
  });
});
