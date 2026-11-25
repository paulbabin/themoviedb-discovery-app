// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import MostPopularMovieWidget, {
  type PopularMovieWidgetMovie,
} from './MostPopularMovieWidget';

afterEach(cleanup);

const movie: PopularMovieWidgetMovie = {
  title: 'Example Movie',
  poster_path: '/example-poster.jpg',
  release_date: '2024-05-10',
  popularity: 1036.49,
};

describe('MostPopularMovieWidget', () => {
  it('renders the label, poster, title, year, and popularity with two decimals', () => {
    // Arrange and act: render a complete popular-movie widget.
    render(<MostPopularMovieWidget status="ready" movie={movie} />);

    // Assert: popularity is clearly labeled and formatted independently of ratings or votes.
    expect(
      screen.getAllByText('Film le plus populaire').length,
    ).toBeGreaterThan(0);
    expect(
      screen
        .getByRole('img', { name: `Affiche de ${movie.title}` })
        .getAttribute('src'),
    ).toBe('https://image.tmdb.org/t/p/w300/example-poster.jpg');
    expect(
      screen.getByRole('heading', { level: 2, name: movie.title }),
    ).toBeTruthy();
    expect(screen.getByText('2024')).toBeTruthy();
    expect(screen.getByText('Indice de popularité')).toBeTruthy();
    expect(screen.getByText('1 036,49')).toBeTruthy();
  });

  it('renders missing poster and unknown popularity fallbacks', () => {
    // Arrange: remove optional visual and popularity data.
    const incompleteMovie = {
      ...movie,
      poster_path: null,
      popularity: null,
      release_date: null,
    };

    // Act
    render(<MostPopularMovieWidget status="ready" movie={incompleteMovie} />);

    // Assert: incomplete fields have explicit, accessible fallbacks.
    expect(
      screen.getByRole('img', { name: `Affiche absente pour ${movie.title}` }),
    ).toBeTruthy();
    expect(screen.queryByText('2024')).toBeNull();
    expect(screen.getByText('Valeur inconnue')).toBeTruthy();
  });

  it('renders loading, empty, and error states', () => {
    // Arrange and act: verify each non-ready widget state separately.
    const { rerender } = render(<MostPopularMovieWidget status="loading" />);

    // Assert loading
    expect(
      screen.getByText('Chargement du film le plus populaire...'),
    ).toBeTruthy();

    rerender(<MostPopularMovieWidget status="empty" />);
    expect(screen.getByText('Aucun film populaire disponible.')).toBeTruthy();

    rerender(<MostPopularMovieWidget status="error" />);
    expect(
      screen.getByText('Impossible de charger le film le plus populaire.'),
    ).toBeTruthy();
  });
});
