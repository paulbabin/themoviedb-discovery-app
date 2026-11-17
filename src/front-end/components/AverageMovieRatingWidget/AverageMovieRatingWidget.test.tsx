// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import AverageMovieRatingWidget from './AverageMovieRatingWidget';

afterEach(cleanup);

describe('AverageMovieRatingWidget', () => {
  it('renders the French-formatted rating, scale, and calculation method', () => {
    // Arrange and act
    render(
      <AverageMovieRatingWidget
        state="ready"
        averageRating={6.78}
        calculation="simple"
      />,
    );

    // Assert: the widget exposes the requested label, format, and scale.
    expect(
      screen.getByRole('heading', { level: 2, name: 'Note moyenne' }),
    ).toBeTruthy();
    expect(screen.getByText('6,78 / 10')).toBeTruthy();
    expect(
      screen.getByText('Moyenne simple calculée sur le catalogue.'),
    ).toBeTruthy();
  });

  it('distinguishes a weighted average and renders states without ratings', () => {
    // Arrange
    const { rerender } = render(
      <AverageMovieRatingWidget
        state="ready"
        averageRating={7}
        calculation="weighted"
      />,
    );

    // Act and assert: the weighted method is explicit.
    expect(screen.getByText('7,00 / 10')).toBeTruthy();
    expect(
      screen.getByText('Moyenne pondérée calculée sur le catalogue.'),
    ).toBeTruthy();

    rerender(<AverageMovieRatingWidget state="loading" />);
    expect(
      screen.getByText('La note moyenne est en cours de chargement.'),
    ).toBeTruthy();

    rerender(<AverageMovieRatingWidget state="empty" />);
    expect(
      screen.getByText('Aucune note disponible pour le catalogue.'),
    ).toBeTruthy();
    expect(screen.queryByText(/0,00 \/ 10/)).toBeNull();

    rerender(
      <AverageMovieRatingWidget state="error" message="Erreur de calcul." />,
    );
    expect(screen.getByText('Erreur de calcul.')).toBeTruthy();

    rerender(<AverageMovieRatingWidget state="error" />);
    expect(
      screen.getByText('La note moyenne n’est pas disponible.'),
    ).toBeTruthy();
  });
});
