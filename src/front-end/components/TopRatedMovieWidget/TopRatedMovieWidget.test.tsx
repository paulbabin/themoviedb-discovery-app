// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { Movie } from '../../../back-end/types/MoviesTypes';
import TopRatedMovieWidget from './TopRatedMovieWidget';

afterEach(cleanup);

const movie = {
  id: 123,
  title: 'The Highest Rated Movie With A Very Long Title',
  release_date: '2024-05-10',
  vote_average: 9.123,
  poster_path: '/top-rated-poster.jpg',
} as Movie;

describe('TopRatedMovieWidget', () => {
  it('renders the supplied movie details and rating scale', () => {
    // Arrange and act
    render(<TopRatedMovieWidget state="ready" movie={movie} />);

    // Assert: the card exposes its label, poster, title, year, and rating.
    expect(
      screen.getByRole('heading', { level: 2, name: 'Film le mieux noté' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('img', { name: `Affiche de ${movie.title}` }),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', { level: 3, name: movie.title }),
    ).toBeTruthy();
    expect(screen.getByText('Année : 2024')).toBeTruthy();
    expect(screen.getByText('Note :')).toBeTruthy();
    expect(screen.getByText('9.1 / 10')).toBeTruthy();
  });

  it('uses an explicit poster fallback for missing and inaccessible images', () => {
    // Arrange
    const movieWithoutPoster = { ...movie, poster_path: '' } as Movie;
    const { rerender } = render(
      <TopRatedMovieWidget state="ready" movie={movieWithoutPoster} />,
    );

    // Act and assert: a missing poster remains explicit and accessible.
    expect(
      screen.getByRole('img', {
        name: `Affiche indisponible pour ${movieWithoutPoster.title}`,
      }),
    ).toBeTruthy();

    rerender(<TopRatedMovieWidget state="ready" movie={movie} />);
    fireEvent.error(
      screen.getByRole('img', { name: `Affiche de ${movie.title}` }),
    );
    expect(
      screen.getByRole('img', {
        name: `Affiche indisponible pour ${movie.title}`,
      }),
    ).toBeTruthy();
  });

  it('renders unknown years and loading, empty, and error states', () => {
    // Arrange
    const { rerender } = render(
      <TopRatedMovieWidget
        state="ready"
        movie={{ ...movie, release_date: '' } as Movie}
      />,
    );

    // Act and assert
    expect(screen.getByText('Année : Année inconnue')).toBeTruthy();

    rerender(<TopRatedMovieWidget state="loading" />);
    expect(
      screen.getByText('Le film le mieux noté est en cours de chargement.'),
    ).toBeTruthy();

    rerender(<TopRatedMovieWidget state="empty" />);
    expect(screen.getByText('Aucun film noté disponible.')).toBeTruthy();

    rerender(
      <TopRatedMovieWidget state="error" message="Erreur de lecture." />,
    );
    expect(screen.getByText('Erreur de lecture.')).toBeTruthy();

    rerender(<TopRatedMovieWidget state="error" />);
    expect(
      screen.getByText('Le film le mieux noté est indisponible.'),
    ).toBeTruthy();
  });
});
