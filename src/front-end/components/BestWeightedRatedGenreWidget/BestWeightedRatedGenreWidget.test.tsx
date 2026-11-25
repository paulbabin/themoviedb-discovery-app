// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { BestWeightedRatedGenreWidgetData } from '../../../back-end/types/MoviesTypes';
import BestWeightedRatedGenreWidget from './BestWeightedRatedGenreWidget';

afterEach(cleanup);

describe('BestWeightedRatedGenreWidget', () => {
  it('renders the provided genre and weighted rating on a ten-point scale', () => {
    // Arrange: provide the precomputed weighted result.
    const data: BestWeightedRatedGenreWidgetData = {
      genre_name: 'Animation',
      average_weighted_rating: 7.68,
    };

    // Act
    render(<BestWeightedRatedGenreWidget state="ready" data={data} />);

    // Assert: the title, genre, formatted rating, and weighted method are visible.
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Meilleure note pondérée',
      }),
    ).toBeTruthy();
    expect(screen.getByText('Animation')).toBeTruthy();
    expect(screen.getByText('7,68 / 10')).toBeTruthy();
    expect(
      screen.getByText('Moyenne pondérée des notes valides du genre.'),
    ).toBeTruthy();
  });

  it('displays a missing weighted rating as unavailable rather than zero', () => {
    // Arrange: no weighted rating has been computed for this result.
    const data: BestWeightedRatedGenreWidgetData = {
      genre_name: 'Animation',
      average_weighted_rating: null,
    };

    // Act
    const { rerender } = render(
      <BestWeightedRatedGenreWidget state="ready" data={data} />,
    );

    // Assert: unknown and non-finite ratings are not presented as zero.
    expect(screen.getByText('Note indisponible')).toBeTruthy();
    expect(screen.queryByText('0,00 / 10')).toBeNull();

    rerender(
      <BestWeightedRatedGenreWidget
        state="ready"
        data={{ ...data, average_weighted_rating: Number.NaN }}
      />,
    );
    expect(screen.getByText('Note indisponible')).toBeTruthy();

    rerender(
      <BestWeightedRatedGenreWidget
        state="ready"
        data={{ genre_name: null, average_weighted_rating: null }}
      />,
    );
    expect(screen.getByText('Genre inconnu')).toBeTruthy();
  });

  it('renders no-result, loading, and error states', () => {
    // Arrange and act: render each mutually exclusive widget state.
    const { rerender } = render(<BestWeightedRatedGenreWidget state="empty" />);
    expect(screen.getByText('Aucune note disponible')).toBeTruthy();
    expect(
      screen.getByText('Aucun genre admissible ne possède de note valide.'),
    ).toBeTruthy();

    rerender(<BestWeightedRatedGenreWidget state="loading" />);
    expect(screen.getByRole('status').textContent).toContain('chargement');

    rerender(
      <BestWeightedRatedGenreWidget
        state="error"
        message="Erreur de calcul."
      />,
    );
    expect(screen.getByRole('alert').textContent).toBe('Erreur de calcul.');

    rerender(<BestWeightedRatedGenreWidget state="error" />);
    expect(
      screen.getByText(
        'La meilleure note pondérée par genre est indisponible.',
      ),
    ).toBeTruthy();
  });
});
