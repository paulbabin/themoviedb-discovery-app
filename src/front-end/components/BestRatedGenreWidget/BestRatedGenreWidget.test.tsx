// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { BestRatedGenreWidgetData } from '../../../back-end/types/MoviesTypes';
import BestRatedGenreWidget from './BestRatedGenreWidget';

afterEach(cleanup);

describe('BestRatedGenreWidget', () => {
  it('renders the provided genre and its simple average on a ten-point scale', () => {
    // Arrange: the aggregate is explicitly a precomputed simple average.
    const data: BestRatedGenreWidgetData = {
      genre_name: 'Animation',
      average_simple_rating: 7.41,
    };

    // Act
    render(<BestRatedGenreWidget state="ready" data={data} />);

    // Assert: genre, formatted rating, scale, and averaging method are visible.
    expect(
      screen.getByRole('heading', { level: 2, name: 'Meilleure note' }),
    ).toBeTruthy();
    expect(screen.getByText('Animation')).toBeTruthy();
    expect(screen.getByText('7,41 / 10')).toBeTruthy();
    expect(
      screen.getByText('Moyenne simple des notes valides du genre.'),
    ).toBeTruthy();
  });

  it('keeps a long genre name readable without truncating it', () => {
    // Arrange: genre names can be longer than a typical category label.
    const longGenreName = 'Science-fiction et aventures intergalactiques';
    const data: BestRatedGenreWidgetData = {
      genre_name: longGenreName,
      average_simple_rating: 7.41,
    };

    // Act
    render(<BestRatedGenreWidget state="ready" data={data} />);

    // Assert: the full name is preserved in the rendered content.
    expect(screen.getByText(longGenreName)).toBeTruthy();
  });

  it('does not present a missing or invalid rating as zero', () => {
    // Arrange: the genre exists, but has no valid average rating.
    const data: BestRatedGenreWidgetData = {
      genre_name: 'Animation',
      average_simple_rating: null,
    };

    // Act
    const { rerender } = render(
      <BestRatedGenreWidget state="ready" data={data} />,
    );

    // Assert: an unavailable rating is explicit and distinct from zero.
    expect(screen.getByText('Note indisponible')).toBeTruthy();
    expect(screen.queryByText('0,00 / 10')).toBeNull();

    rerender(
      <BestRatedGenreWidget
        state="ready"
        data={{ ...data, average_simple_rating: Number.NaN }}
      />,
    );
    expect(screen.getByText('Note indisponible')).toBeTruthy();

    rerender(
      <BestRatedGenreWidget
        state="ready"
        data={{
          genre_name: null,
          average_simple_rating: null,
        }}
      />,
    );
    expect(screen.getByText('Genre inconnu')).toBeTruthy();
  });

  it('renders the no-valid-ratings, loading, and error states', () => {
    // Arrange and act: render each mutually exclusive widget state.
    const { rerender } = render(<BestRatedGenreWidget state="empty" />);
    expect(screen.getByText('Aucune note disponible')).toBeTruthy();
    expect(
      screen.getByText('Aucun genre ne possède de note valide.'),
    ).toBeTruthy();

    rerender(<BestRatedGenreWidget state="loading" />);
    expect(screen.getByRole('status').textContent).toContain('chargement');
    expect(
      screen.getByText(
        'La meilleure note par genre est en cours de chargement.',
      ),
    ).toBeTruthy();

    rerender(
      <BestRatedGenreWidget state="error" message="Erreur de calcul." />,
    );
    expect(screen.getByRole('alert').textContent).toBe('Erreur de calcul.');

    rerender(<BestRatedGenreWidget state="error" />);
    expect(
      screen.getByText('La meilleure note par genre est indisponible.'),
    ).toBeTruthy();
  });
});
