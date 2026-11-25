// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { LeastProfitableMovieWidgetData } from '../../../back-end/types/MoviesTypes';
import LeastProfitableMovieWidget from './LeastProfitableMovieWidget';

afterEach(cleanup);

const movie: LeastProfitableMovieWidgetData = {
  title: 'The Example',
  release_year: 2024,
  poster_path: '/example-poster.jpg',
  roi_percentage: -100,
};

describe('LeastProfitableMovieWidget', () => {
  it('renders the provided movie, year, poster, and negative ROI', () => {
    // Arrange and act: pass the precomputed least-profitable movie.
    render(<LeastProfitableMovieWidget state="ready" movie={movie} />);

    // Assert: the card displays the supplied details and preserves the minus sign.
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Film le moins rentable',
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', { level: 3, name: movie.title }),
    ).toBeTruthy();
    expect(screen.getByText('Année : 2024')).toBeTruthy();
    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === 'STRONG' && element.textContent === '-100,00 %',
      ),
    ).toBeTruthy();
    expect(
      screen
        .getByRole('img', { name: `Affiche de ${movie.title}` })
        .getAttribute('src'),
    ).toBe('https://image.tmdb.org/t/p/w300/example-poster.jpg');
  });

  it('displays a valid zero ROI as a percentage', () => {
    // Arrange: zero is a known ROI, not a missing value.
    const movieWithZeroRoi = { ...movie, roi_percentage: 0 };

    // Act
    render(
      <LeastProfitableMovieWidget state="ready" movie={movieWithZeroRoi} />,
    );

    // Assert
    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === 'STRONG' && element.textContent === '0,00 %',
      ),
    ).toBeTruthy();
    expect(screen.queryByText('Non renseigné')).toBeNull();
  });

  it('displays an unknown ROI as unavailable instead of zero', () => {
    // Arrange: null explicitly represents missing ROI and year values.
    const movieWithUnknownValues = {
      ...movie,
      release_year: null,
      roi_percentage: null,
    };

    // Act
    render(
      <LeastProfitableMovieWidget
        state="ready"
        movie={movieWithUnknownValues}
      />,
    );

    // Assert: unknown values remain distinct from valid zero values.
    expect(screen.getByText('Non renseigné')).toBeTruthy();
    expect(screen.getByText('Année : Inconnue')).toBeTruthy();
    expect(screen.queryByText('0,00 %')).toBeNull();
  });

  it('shows an accessible placeholder when the poster is absent', () => {
    // Arrange: the candidate has no poster path.
    const movieWithoutPoster = { ...movie, poster_path: null };

    // Act
    render(
      <LeastProfitableMovieWidget state="ready" movie={movieWithoutPoster} />,
    );

    // Assert: no broken image is rendered.
    expect(screen.getByRole('img', { name: 'Affiche absente' })).toBeTruthy();
    expect(
      screen.queryByRole('img', { name: `Affiche de ${movie.title}` }),
    ).toBeNull();
  });

  it('renders empty, loading, and error states', () => {
    // Arrange and act: show each mutually exclusive widget state.
    const { rerender } = render(<LeastProfitableMovieWidget state="empty" />);
    expect(screen.getByText('Aucun film éligible.')).toBeTruthy();

    rerender(<LeastProfitableMovieWidget state="loading" />);
    expect(screen.getByRole('status').textContent).toContain('Chargement');
    expect(screen.getByRole('article').getAttribute('aria-busy')).toBe('true');

    rerender(<LeastProfitableMovieWidget state="error" />);
    expect(screen.getByRole('alert').textContent).toContain('Impossible');
  });
});
