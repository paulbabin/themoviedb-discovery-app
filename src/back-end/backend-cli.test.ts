import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const DEFAULT_DATABASE_PATH = '/tmp/movies-default.sqlite';

const closeMock = vi.fn();
const getDatabaseMock = vi.fn(() => ({
  close: closeMock,
}));
const readGenresCsvMock = vi.fn(() => [
  { id: 18, name: 'Drama' },
  { id: 28, name: 'Action' },
]);
const upsertGenresMock = vi.fn(() => 2);
const cleanUnusedGenresMock = vi.fn(() => 1);

vi.mock('./database/schema.ts', () => ({
  DEFAULT_DATABASE_PATH,
  getDatabase: getDatabaseMock,
}));

vi.mock('./database/genre-repository.ts', () => ({
  readGenresCsv: readGenresCsvMock,
  upsertGenres: upsertGenresMock,
  cleanUnusedGenres: cleanUnusedGenresMock,
}));

/**
 * Executes the backend CLI with the specified command-line arguments
 * @param args The command-line arguments to pass to the CLI
 */
async function runCliWithArgs(args: string[]): Promise<void> {
  const originalArgv = process.argv;
  process.argv = ['node', 'src/back-end/backend-cli.ts', ...args];
  try {
    await import('./backend-cli.ts');
  } finally {
    process.argv = originalArgv;
  }
}

describe('backend-cli.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('create-database', () => {
    it('uses the default database path when the subcommand has no path option', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['create-database']);

        expect(getDatabaseMock).toHaveBeenCalledWith(DEFAULT_DATABASE_PATH);
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Database available at ${resolve(DEFAULT_DATABASE_PATH)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('uses the path passed in --path', async () => {
      const customDatabasePath = './data/custom-movies.sqlite';
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['create-database', '--path', customDatabasePath]);

        expect(getDatabaseMock).toHaveBeenCalledWith(customDatabasePath);
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Database available at ${resolve(customDatabasePath)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });
  });

  describe('add-genres', () => {
    it('validates the CSV before opening the default database', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['add-genres', '/tmp/genres.csv']);

        expect(getDatabaseMock).toHaveBeenCalledWith(DEFAULT_DATABASE_PATH);
        expect(readGenresCsvMock).toHaveBeenCalledWith('/tmp/genres.csv');
        expect(upsertGenresMock).toHaveBeenCalledWith(
          expect.objectContaining({ close: closeMock }),
          [
            { id: 18, name: 'Drama' },
            { id: 28, name: 'Action' },
          ],
        );
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `2 genre(s) imported in ${resolve(DEFAULT_DATABASE_PATH)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('uses custom database path and closes the database on failure', async () => {
      const customDatabasePath = './data/custom-movies.sqlite';
      upsertGenresMock.mockImplementationOnce(() => {
        throw new Error('Invalid genres CSV');
      });

      await expect(
        runCliWithArgs([
          '--path',
          customDatabasePath,
          'add-genres',
          './data/custom-genres.csv',
        ]),
      ).rejects.toThrow('Invalid genres CSV');
      expect(getDatabaseMock).toHaveBeenCalledWith(customDatabasePath);
      expect(upsertGenresMock).toHaveBeenCalledWith(
        expect.objectContaining({ close: closeMock }),
        expect.any(Array),
      );
      expect(closeMock).toHaveBeenCalledOnce();
    });

    it('propagates CSV validation errors before opening the database', async () => {
      readGenresCsvMock.mockImplementationOnce(() => {
        throw new Error('Invalid genres CSV');
      });

      await expect(
        runCliWithArgs([
          '--path',
          './data/custom-movies.sqlite',
          'add-genres',
          './data/custom-genres.csv',
        ]),
      ).rejects.toThrow('Invalid genres CSV');
      expect(getDatabaseMock).not.toHaveBeenCalled();
    });
  });

  describe('clean-genres', () => {
    it('removes unused genres and reports the count and database path', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs([
          'clean-genres',
          '--path',
          './data/custom-movies.sqlite',
        ]);

        expect(getDatabaseMock).toHaveBeenCalledWith(
          './data/custom-movies.sqlite',
        );
        expect(cleanUnusedGenresMock).toHaveBeenCalledWith(
          expect.objectContaining({ close: closeMock }),
        );
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `1 genre(s) removed from ${resolve('./data/custom-movies.sqlite')}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });
  });
});
