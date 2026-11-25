// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { MostProfitableMovieWidgetData } from '../../../back-end/types/MoviesTypes';
import MostProfitableMovieWidget from './MostProfitableMovieWidget';

afterEach(cleanup);

const movie: MostProfitableMovieWidgetData = {
  title: 'The Example',
  release_year: 2024,
  poster_path: '/example-poster.jpg',
  roi_percentage: 69667.36,
};

describe('MostProfitableMovieWidget', () => {
  it('renders the provided movie, year, poster, and ROI without recalculating it', () => {
    // Arrange and act: provide the precomputed candidate and its ROI.
    render(<MostProfitableMovieWidget state="ready" movie={movie} />);

    // Assert: the card displays the supplied values with French percentage formatting.
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Film le plus rentable',
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', { level: 3, name: movie.title }),
    ).toBeTruthy();
    expect(screen.getByText('Année : 2024')).toBeTruthy();
    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === 'STRONG' &&
          element.textContent === '69\u202f667,36 %',
      ),
    ).toBeTruthy();
    expect(
      screen
        .getByRole('img', { name: `Affiche de ${movie.title}` })
        .getAttribute('src'),
    ).toBe('https://image.tmdb.org/t/p/w300/example-poster.jpg');
  });

  it('shows an accessible placeholder when the poster is absent', () => {
    // Arrange: the candidate has no poster path.
    const movieWithoutPoster = { ...movie, poster_path: null };

    // Act
    render(
      <MostProfitableMovieWidget state="ready" movie={movieWithoutPoster} />,
    );

    // Assert: the missing poster is represented without a broken image.
    expect(screen.getByRole('img', { name: 'Affiche absente' })).toBeTruthy();
    expect(
      screen.queryByRole('img', { name: `Affiche de ${movie.title}` }),
    ).toBeNull();
  });

  it('does not present an unknown ROI or year as zero', () => {
    // Arrange: metric and year are not available in the supplied result.
    const movieWithUnknownValues = {
      ...movie,
      release_year: null,
      roi_percentage: null,
    };

    // Act
    render(
      <MostProfitableMovieWidget
        state="ready"
        movie={movieWithUnknownValues}
      />,
    );

    // Assert: unknown values remain explicit rather than becoming zero.
    expect(screen.getByText('Année : Inconnue')).toBeTruthy();
    expect(screen.getByText('Non renseigné')).toBeTruthy();
    expect(screen.queryByText('0,00 %')).toBeNull();
  });

  it('renders the empty, loading, and error states', () => {
    // Arrange and act: render each mutually exclusive widget state.
    const { rerender } = render(<MostProfitableMovieWidget state="empty" />);
    expect(screen.getByText('Aucun film éligible.')).toBeTruthy();

    rerender(<MostProfitableMovieWidget state="loading" />);
    expect(screen.getByRole('status').textContent).toContain('Chargement');
    expect(screen.getByRole('article').getAttribute('aria-busy')).toBe('true');

    rerender(<MostProfitableMovieWidget state="error" />);
    expect(screen.getByRole('alert').textContent).toContain('Impossible');
  });
});
