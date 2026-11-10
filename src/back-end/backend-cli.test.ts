import { unlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const DEFAULT_DATABASE_PATH = '/tmp/movies-default.sqlite';

const closeMock = vi.fn();
const getDatabaseMock = vi.fn(() => ({
  close: closeMock,
}));
const upsertCountriesMock = vi.fn(() => 3);
const deleteUnusedCountriesMock = vi.fn(() => 2);

vi.mock('./database/schema.ts', () => ({
  DEFAULT_DATABASE_PATH,
  getDatabase: getDatabaseMock,
}));
vi.mock('./database/country-repository.ts', () => ({
  deleteUnusedCountries: deleteUnusedCountriesMock,
  upsertCountries: upsertCountriesMock,
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

  describe('add-countries', () => {
    it('parses the CSV before opening the selected database and reports the import', async () => {
      // Arrange
      const csvPath = '/tmp/countries-cli-test.csv';
      writeFileSync(csvPath, 'name,code\nFrance,FR\n');
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Act
      try {
        await runCliWithArgs([
          '--path',
          './data/custom.sqlite',
          'add-countries',
          csvPath,
        ]);

        // Assert
        expect(getDatabaseMock).toHaveBeenCalledWith('./data/custom.sqlite');
        expect(upsertCountriesMock).toHaveBeenCalledWith(expect.anything(), [
          { code: 'FR', name: 'France' },
        ]);
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Imported 3 countries into ${resolve('./data/custom.sqlite')}`,
        );
      } finally {
        unlinkSync(csvPath);
        logSpy.mockRestore();
      }
    });

    it('closes the database and propagates import failures', async () => {
      // Arrange
      const csvPath = '/tmp/countries-cli-failure.csv';
      writeFileSync(csvPath, 'code,name\nFR,France\n');
      const error = new Error('import failed');
      upsertCountriesMock.mockImplementationOnce(() => {
        throw error;
      });

      // Act and Assert
      try {
        await expect(
          runCliWithArgs(['add-countries', csvPath]),
        ).rejects.toThrow(error);
        expect(closeMock).toHaveBeenCalledOnce();
      } finally {
        unlinkSync(csvPath);
      }
    });

    it('does not open the database when CSV validation fails', async () => {
      // Arrange
      const csvPath = '/tmp/invalid-countries-cli-test.csv';
      writeFileSync(csvPath, 'code,name\nfR,France\n');

      // Act and Assert
      try {
        await expect(
          runCliWithArgs(['add-countries', csvPath]),
        ).rejects.toThrow(/Invalid country code/);
        expect(getDatabaseMock).not.toHaveBeenCalled();
      } finally {
        unlinkSync(csvPath);
      }
    });
  });

  describe('clean-countries', () => {
    it('deletes unused countries and reports the selected database', async () => {
      // Arrange
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Act
      try {
        await runCliWithArgs([
          'clean-countries',
          '--path',
          './data/custom.sqlite',
        ]);

        // Assert
        expect(getDatabaseMock).toHaveBeenCalledWith('./data/custom.sqlite');
        expect(deleteUnusedCountriesMock).toHaveBeenCalledWith(
          expect.anything(),
        );
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Deleted 2 unused countries from ${resolve('./data/custom.sqlite')}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });
  });
});
