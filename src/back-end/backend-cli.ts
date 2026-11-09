#!/usr/bin/env node
import { Command } from 'commander';
import { resolve } from 'node:path';
import { DEFAULT_DATABASE_PATH, getDatabase } from './database/schema.ts';
import {
  DEFAULT_GENRES_CSV_PATH,
  syncGenresFromCsv,
} from './database/genre-repository.ts';

/** Command-line interface for movie database operations. */
const program = new Command().description('CLI for movie database operations');

program
  .command('create-database')
  .description('Create and initialize the movies database schema')
  .option(
    '-p, --path <path>',
    'path to the SQLite database file',
    DEFAULT_DATABASE_PATH,
  )
  .action(({ path }: { path: string }) => {
    const database = getDatabase(path);
    database.close();
    console.log(`Database available at ${resolve(path)}`);
  });

program
  .command('update-genres')
  .alias('create-genres')
  .alias('sync-genres')
  .description('Create and update movie genres from a CSV file')
  .option(
    '-p, --path <path>',
    'path to the SQLite database file',
    DEFAULT_DATABASE_PATH,
  )
  .option(
    '-f, --file <path>',
    'path to the genres CSV file',
    DEFAULT_GENRES_CSV_PATH,
  )
  .action(({ path, file }: { path: string; file: string }) => {
    const database = getDatabase(path);
    try {
      const genreCount = syncGenresFromCsv(database, file);
      console.log(
        `${genreCount} genre(s) created or updated in ${resolve(path)}`,
      );
    } finally {
      database.close();
    }
  });

program.parse();
