import type { Express, Request, RequestHandler, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerDiscoverApi } from './discover-api';
import type { TmdbMoviesRawResponse } from '../types/MoviesTypes';

const { toSupportedMovieMock } = vi.hoisted(() => ({
  toSupportedMovieMock: vi.fn(),
}));

vi.mock('../utils/converter', () => ({
  toSupportedMovie: toSupportedMovieMock,
}));

vi.mock('../utils/config', () => ({
  tmdbAccessToken: 'test-access-token',
}));

type RouteHandler = (
  req: Request,
  res: Response,
  next: (error?: unknown) => void,
) => void | Promise<void>;

const handlers = new Map<string, RequestHandler>();
const app = {
  get: (path: string, handler: RequestHandler) => handlers.set(path, handler),
} as unknown as Express;

function getHandler(): RouteHandler {
  const handler = handlers.get('/api/discover/movies');
  if (!handler) throw new Error('Discover route was not registered');
  return handler as RouteHandler;
}

function createResponse() {
  const response = { json: vi.fn(), status: vi.fn() };
  response.status.mockReturnValue(response);
  return response as unknown as Response & {
    json: ReturnType<typeof vi.fn>;
    status: ReturnType<typeof vi.fn>;
  };
}

function tmdbResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

describe('discover API', () => {
  beforeEach(() => {
    handlers.clear();
    registerDiscoverApi(app);
    toSupportedMovieMock.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('registers the route and returns discovered movies with default options', async () => {
    // Arrange
    const rawMovie = { id: 1 };
    const rawData = {
      page: 1,
      results: [rawMovie],
      total_pages: 2,
      total_results: 1,
    } as unknown as TmdbMoviesRawResponse;
    const supportedMovie = { id: 1, title: 'Movie' };
    const fetchMock = vi.fn().mockResolvedValue(tmdbResponse(rawData));
    vi.stubGlobal('fetch', fetchMock);
    toSupportedMovieMock.mockReturnValue(supportedMovie);
    const response = createResponse();

    // Act
    await getHandler()(
      { query: { year: '2020' } } as unknown as Request,
      response,
      vi.fn(),
    );

    // Assert
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/discover/movie?primary_release_year=2020&language=fr-FR&page=1&region=FR',
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-access-token',
          'Content-Type': 'application/json;charset=utf-8',
        },
      }),
    );
    expect(toSupportedMovieMock).toHaveBeenCalledWith(rawMovie, 0, [rawMovie]);
    expect(response.json).toHaveBeenCalledWith({
      page: 1,
      results: [supportedMovie],
      total_pages: 2,
      total_results: 1,
    });
  });

  it('forwards custom options and preserves an empty TMDB result', async () => {
    // Arrange
    const rawData = {
      page: 2,
      results: [],
      total_pages: 2,
      total_results: 0,
    } as unknown as TmdbMoviesRawResponse;
    const fetchMock = vi.fn().mockResolvedValue(tmdbResponse(rawData));
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    // Act
    await getHandler()(
      {
        query: { year: '2020', language: 'en-US', page: '2', region: 'US' },
      } as unknown as Request,
      response,
      vi.fn(),
    );

    // Assert
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/discover/movie?primary_release_year=2020&language=en-US&page=2&region=US',
      expect.anything(),
    );
    expect(response.json).toHaveBeenCalledWith(rawData);
  });

  it.each([
    ['missing', {}],
    ['too short', { year: '999' }],
    ['too low', { year: '0999' }],
    ['too high', { year: '10000' }],
    ['non-numeric', { year: '20ab' }],
    ['multiple', { year: ['2020', '2021'] }],
    ['structured', { year: { value: '2020' } }],
  ])('rejects %s year values without calling TMDB', async (_label, query) => {
    // Arrange
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    // Act
    await getHandler()({ query } as unknown as Request, response, vi.fn());

    // Assert
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: 'year must be a four-digit year between 1000 and 9999',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ['HTTP', tmdbResponse({}, false, 503)],
    ['network', new Error('Network error')],
    ['JSON', tmdbResponse({})],
  ])(
    'returns and logs a 500 error for %s failures',
    async (_label, failure) => {
      // Arrange
      const fetchMock =
        failure instanceof Error
          ? vi.fn().mockRejectedValue(failure)
          : vi.fn().mockResolvedValue(failure);
      if (!(failure instanceof Error)) {
        failure.json = vi.fn().mockRejectedValue(new Error('Invalid JSON'));
      }
      vi.stubGlobal('fetch', fetchMock);
      const response = createResponse();

      // Act
      await getHandler()(
        { query: { year: '2020' } } as unknown as Request,
        response,
        vi.fn(),
      );

      // Assert
      expect(console.error).toHaveBeenCalled();
      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith({
        error: 'Failed to discover movies',
      });
    },
  );
});
