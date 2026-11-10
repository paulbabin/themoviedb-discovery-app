#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseCountriesCsv } from './database/country-csv.ts';
import {
  deleteUnusedCountries,
  upsertCountries,
} from './database/country-repository.ts';
import { DEFAULT_DATABASE_PATH, getDatabase } from './database/schema.ts';

/** Command-line interface for movie database operations. */
const program = new Command().description('CLI for movie database operations');
program.option('-p, --path <path>', 'path to the SQLite database file');

function getCommandDatabasePath(commandPath?: string): string {
  return commandPath ?? program.opts().path ?? DEFAULT_DATABASE_PATH;
}

program
  .command('create-database')
  .description('Create and initialize the movies database schema')
  .option('-p, --path <path>', 'path to the SQLite database file')
  .action(({ path }: { path?: string }) => {
    const databasePath = getCommandDatabasePath(path);
    const database = getDatabase(databasePath);
    database.close();
    console.log(`Database available at ${resolve(databasePath)}`);
  });

program
  .command('add-countries <csv-file>')
  .description('Import or update countries from a CSV file')
  .option('-p, --path <path>', 'path to the SQLite database file')
  .action((csvFile: string, { path }: { path?: string }) => {
    const countries = parseCountriesCsv(readFileSync(csvFile, 'utf8'));
    const databasePath = getCommandDatabasePath(path);
    const database = getDatabase(databasePath);
    try {
      const count = upsertCountries(database, countries);
      console.log(`Imported ${count} countries into ${resolve(databasePath)}`);
    } finally {
      database.close();
    }
  });

program
  .command('clean-countries')
  .description('Remove countries that are not associated with a movie')
  .option('-p, --path <path>', 'path to the SQLite database file')
  .action(({ path }: { path?: string }) => {
    const databasePath = getCommandDatabasePath(path);
    const database = getDatabase(databasePath);
    try {
      const count = deleteUnusedCountries(database);
      console.log(
        `Deleted ${count} unused countries from ${resolve(databasePath)}`,
      );
    } finally {
      database.close();
    }
  });

program.parse();
