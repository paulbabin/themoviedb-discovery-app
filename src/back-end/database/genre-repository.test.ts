import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import {
  findGenreById,
  listGenres,
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
});
