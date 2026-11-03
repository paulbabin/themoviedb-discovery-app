import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const DEFAULT_DATABASE_PATH = '/tmp/movies-default.sqlite';

const closeMock = vi.fn();
const getDatabaseMock = vi.fn(() => ({
  close: closeMock,
}));
const syncGenresFromCsvMock = vi.fn(() => 19);

vi.mock('./database/schema.ts', () => ({
  DEFAULT_DATABASE_PATH,
  getDatabase: getDatabaseMock,
}));

vi.mock('./database/genres.ts', () => ({
  DEFAULT_GENRES_CSV_PATH: '/tmp/genres.csv',
  syncGenresFromCsv: syncGenresFromCsvMock,
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

  describe('update-genres', () => {
    it('uses the default database and CSV paths', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['update-genres']);

        expect(getDatabaseMock).toHaveBeenCalledWith(DEFAULT_DATABASE_PATH);
        expect(syncGenresFromCsvMock).toHaveBeenCalledWith(
          expect.objectContaining({ close: closeMock }),
          '/tmp/genres.csv',
        );
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `19 genre(s) created or updated in ${resolve(DEFAULT_DATABASE_PATH)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('uses custom database and CSV paths and closes the database on failure', async () => {
      const customDatabasePath = './data/custom-movies.sqlite';
      const customCsvPath = './data/custom-genres.csv';
      syncGenresFromCsvMock.mockImplementationOnce(() => {
        throw new Error('Invalid genres CSV');
      });

      await expect(
        runCliWithArgs([
          'create-genres',
          '--path',
          customDatabasePath,
          '--file',
          customCsvPath,
        ]),
      ).rejects.toThrow('Invalid genres CSV');
      expect(getDatabaseMock).toHaveBeenCalledWith(customDatabasePath);
      expect(syncGenresFromCsvMock).toHaveBeenCalledWith(
        expect.objectContaining({ close: closeMock }),
        customCsvPath,
      );
      expect(closeMock).toHaveBeenCalledOnce();
    });
  });
});
