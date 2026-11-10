import type { Express, Request, Response } from 'express';
import { tmdbAccessToken } from '../utils/config';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_PAGE,
  DEFAULT_REGION,
} from '../utils/constants';
import { toSupportedMovie } from '../utils/converter';
import type {
  MoviesApiResponse,
  TmdbMoviesRawResponse,
} from '../types/MoviesTypes';

function getNonEmptyQueryString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function isValidYear(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^(?:[1-9]\d{3})$/.test(value) &&
    Number(value) >= 1000 &&
    Number(value) <= 9999
  );
}

/**
 * Registers the TMDB Discover movie route.
 */
export function registerDiscoverApi(app: Express): void {
  app.get(
    '/api/discover/movies',
    async (req: Request, res: Response): Promise<void> => {
      if (!isValidYear(req.query.year)) {
        res.status(400).json({
          error: 'year must be a four-digit year between 1000 and 9999',
        });
        return;
      }

      const queryParams = new URLSearchParams({
        primary_release_year: req.query.year,
        language:
          getNonEmptyQueryString(req.query.language) ?? DEFAULT_LANGUAGE,
        page: getNonEmptyQueryString(req.query.page) ?? String(DEFAULT_PAGE),
        region: getNonEmptyQueryString(req.query.region) ?? DEFAULT_REGION,
      });

      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/discover/movie?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${tmdbAccessToken}`,
              'Content-Type': 'application/json;charset=utf-8',
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `TMDB API request failed with status ${response.status}`,
          );
        }

        const rawData = (await response.json()) as TmdbMoviesRawResponse;
        const data: MoviesApiResponse = {
          page: rawData.page,
          results: rawData.results.map(toSupportedMovie),
          total_pages: rawData.total_pages,
          total_results: rawData.total_results,
        };

        res.json(data);
      } catch (error) {
        console.error('Error discovering movies:', error);
        res.status(500).json({ error: 'Failed to discover movies' });
      }
    },
  );
}
