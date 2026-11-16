import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initializeSchema } from './schema';
import { importMoviesFromCsv } from './movies-importer';

const csvHeader =
  'id,title,original_title,original_language,overview,release_date,popularity,vote_average,vote_count,poster_path,backdrop_path,runtime,budget,revenue,genres,production_countries';

function createCsvFile(content: string): string {
  const directory = mkdtempSync(join(tmpdir(), 'movies-import-'));
  const filePath = join(directory, 'movies.csv');
  writeFileSync(filePath, content);
  return filePath;
}

describe('movies importer', () => {
  let database: DatabaseSync;

  beforeEach(() => {
    database = new DatabaseSync(':memory:');
    initializeSchema(database);
  });

  afterEach(() => {
    database.close();
  });

  it('imports CSV movies and converts their values for SQLite', () => {
    // Arrange
    const filePath = createCsvFile(
      `${csvHeader}\r\n1,"A, movie","Original movie",en,"An overview",2020-01-02,12.5,7.2,100,/poster.jpg,/backdrop.jpg,120,1000,2000,"[18]","[{""iso_3166_1"":""FR"",""name"":""France""}]"`,
    );

    // Act
    const result = importMoviesFromCsv(database, filePath);

    // Assert
    expect(result).toMatchObject({
      imported: 1,
      created: 1,
      updated: 0,
    });
    expect(
      database
        .prepare(
          'SELECT id, title, release_date, runtime_minutes, budget, revenue FROM movies',
        )
        .all(),
    ).toEqual([
      {
        id: 1,
        title: 'A, movie',
        release_date: '2020-01-02',
        runtime_minutes: 120,
        budget: 1000,
        revenue: 2000,
      },
    ]);
  });

  it('updates existing movies and preserves the transaction for multiple rows', () => {
    // Arrange
    database
      .prepare(
        `INSERT INTO movies (
          id, title, original_title, original_language, overview, collected_at
        ) VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(1, 'Old title', 'Old title', 'en', '', '2020-01-01');
    const filePath = createCsvFile(
      `${csvHeader}\n1,New title,New title,en,,2021-02-03,1.5,8,2,,,90,,,[],"[]"`,
    );

    // Act
    const result = importMoviesFromCsv(database, filePath);

    // Assert
    expect(result).toMatchObject({
      imported: 1,
      created: 0,
      updated: 1,
    });
    expect(
      database.prepare('SELECT title FROM movies WHERE id = 1').get(),
    ).toEqual({
      title: 'New title',
    });
  });

  it('ignores blank CSV lines', () => {
    // Arrange
    const filePath = createCsvFile(
      `${csvHeader}\n\n1,Movie,Movie,en,,,1.5,8,2,,,90,,,[],[]\n,`,
    );

    // Act
    const result = importMoviesFromCsv(database, filePath);

    // Assert
    expect(result.imported).toBe(1);
    expect(
      database.prepare('SELECT COUNT(*) AS count FROM movies').get(),
    ).toEqual({
      count: 1,
    });
  });

  it('rolls back all rows when one CSV row is invalid', () => {
    // Arrange
    const filePath = createCsvFile(
      `${csvHeader}\n2,Valid,Valid,en,,2020-01-01,1,7,1,,,,,,[],[]\ninvalid,Invalid,Invalid,en,,2020-01-01,1,7,1,,,,,,[],[]`,
    );

    // Act
    expect(() => importMoviesFromCsv(database, filePath)).toThrow(
      'Invalid id value: invalid',
    );

    // Assert
    expect(
      database.prepare('SELECT COUNT(*) AS count FROM movies').get(),
    ).toEqual({
      count: 0,
    });
  });

  it('rejects a CSV with an unexpected header', () => {
    // Arrange
    const filePath = createCsvFile('id,title\n1,Movie');

    // Act and Assert
    expect(() => importMoviesFromCsv(database, filePath)).toThrow(
      'Invalid movies CSV header',
    );
  });

  it.each([
    [
      'invalid popularity',
      '1,Movie,Movie,en,,2020-01-01,invalid,7,1,,,,,,[],[]',
      'Invalid popularity value: invalid',
    ],
    [
      'missing identifier',
      ',Movie,Movie,en,,2020-01-01,1,7,1,,,,,,[],[]',
      'Missing id value',
    ],
    [
      'invalid column count',
      '1,Movie',
      'Invalid CSV row at line 2: expected 16 columns',
    ],
  ])('rejects %s', (_label, row, message) => {
    // Arrange
    const filePath = createCsvFile(`${csvHeader}\n${row}`);

    // Act and Assert
    expect(() => importMoviesFromCsv(database, filePath)).toThrow(message);
  });

  it('rejects an unterminated quoted field', () => {
    // Arrange
    const filePath = createCsvFile(`${csvHeader}\n1,"Unterminated`);

    // Act and Assert
    expect(() => importMoviesFromCsv(database, filePath)).toThrow(
      'Invalid CSV: unterminated quoted field',
    );
  });
});
