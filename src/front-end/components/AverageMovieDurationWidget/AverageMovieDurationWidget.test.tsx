// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import AverageMovieDurationWidget from './AverageMovieDurationWidget';

afterEach(cleanup);

describe('AverageMovieDurationWidget', () => {
  it('renders the calculated duration and minute unit', () => {
    // Arrange and act
    render(<AverageMovieDurationWidget state="ready" averageMinutes={107} />);

    // Assert: the widget exposes the requested label, value, and unit.
    expect(
      screen.getByRole('heading', { level: 2, name: 'Durée moyenne' }),
    ).toBeTruthy();
    expect(screen.getByText('107 min')).toBeTruthy();
    expect(
      screen.getByText('Durée moyenne calculée sur les films du catalogue.'),
    ).toBeTruthy();
  });

  it('renders loading, empty, and error states without replacing missing data with zero', () => {
    // Arrange
    const { rerender } = render(<AverageMovieDurationWidget state="loading" />);

    // Act and assert: each state gives users a readable status.
    expect(
      screen.getByText('La durée moyenne est en cours de chargement.'),
    ).toBeTruthy();

    rerender(<AverageMovieDurationWidget state="empty" />);
    expect(screen.getByText('Aucune durée de film disponible.')).toBeTruthy();
    expect(screen.queryByText(/0 min/)).toBeNull();

    rerender(
      <AverageMovieDurationWidget state="error" message="Erreur de calcul." />,
    );
    expect(screen.getByText('Erreur de calcul.')).toBeTruthy();

    rerender(<AverageMovieDurationWidget state="error" />);
    expect(
      screen.getByText('La durée moyenne n’est pas disponible.'),
    ).toBeTruthy();
  });
});
