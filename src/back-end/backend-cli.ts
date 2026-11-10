#!/usr/bin/env node
import { Command } from 'commander';
import { resolve } from 'node:path';
import { DEFAULT_DATABASE_PATH, getDatabase } from './database/schema.ts';
import {
  cleanUnusedGenres,
  readGenresCsv,
  upsertGenres,
} from './database/genre-repository.ts';

/** Command-line interface for movie database operations. */
const program = new Command().description('CLI for movie database operations');
program.option('--path <path>', 'path to the SQLite database file');

function databasePath(localPath: string | undefined, command: Command): string {
  return localPath ?? command.parent?.opts().path ?? DEFAULT_DATABASE_PATH;
}

program
  .command('create-database')
  .description('Create and initialize the movies database schema')
  .option('-p, --path <path>', 'path to the SQLite database file')
  .action(({ path }: { path?: string }, command: Command) => {
    const resolvedPath = databasePath(path, command);
    const database = getDatabase(resolvedPath);
    database.close();
    console.log(`Database available at ${resolve(resolvedPath)}`);
  });

program
  .command('add-genres')
  .argument('<csv-file>', 'path to the genres CSV file')
  .description('Create and update movie genres from a CSV file')
  .option('-p, --path <path>', 'path to the SQLite database file')
  .action((csvFile: string, options: { path?: string }, command: Command) => {
    const genres = readGenresCsv(csvFile);
    const resolvedPath = databasePath(options.path, command);
    const database = getDatabase(resolvedPath);
    try {
      const genreCount = upsertGenres(database, genres);
      console.log(
        `${genreCount} genre(s) imported in ${resolve(resolvedPath)}`,
      );
    } finally {
      database.close();
    }
  });

program
  .command('clean-genres')
  .description('Remove genres that are not associated with a movie')
  .option('-p, --path <path>', 'path to the SQLite database file')
  .action((options: { path?: string }, command: Command) => {
    const resolvedPath = databasePath(options.path, command);
    const database = getDatabase(resolvedPath);
    try {
      const genreCount = cleanUnusedGenres(database);
      console.log(
        `${genreCount} genre(s) removed from ${resolve(resolvedPath)}`,
      );
    } finally {
      database.close();
    }
  });

program.parse();
