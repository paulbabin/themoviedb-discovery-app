// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { Country } from '../../../back-end/types/Country';
import MostRepresentedCountryWidget from './MostRepresentedCountryWidget';

afterEach(cleanup);

const country: Country = {
  code: 'US',
  name: 'United States of America',
};

describe('MostRepresentedCountryWidget', () => {
  it('renders the provided country and movie count', () => {
    // Arrange and act
    render(
      <MostRepresentedCountryWidget
        state="ready"
        country={country}
        movieCount={725}
      />,
    );

    // Assert: the widget displays the supplied aggregate without recalculating it.
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Pays le plus représenté',
      }),
    ).toBeTruthy();
    expect(screen.getByText('United States of America')).toBeTruthy();
    expect(screen.getByText('725 films')).toBeTruthy();
  });

  it('keeps long country names readable and renders states without a country', () => {
    // Arrange
    const { rerender } = render(
      <MostRepresentedCountryWidget
        state="ready"
        country={{ code: 'GB', name: 'United Kingdom of Great Britain' }}
        movieCount={1}
      />,
    );

    // Act and assert: long names and singular counts remain readable.
    expect(screen.getByText('United Kingdom of Great Britain')).toBeTruthy();
    expect(screen.getByText('1 film')).toBeTruthy();

    rerender(<MostRepresentedCountryWidget state="loading" />);
    expect(
      screen.getByText(
        'Le pays le plus représenté est en cours de chargement.',
      ),
    ).toBeTruthy();

    rerender(<MostRepresentedCountryWidget state="empty" />);
    expect(screen.getByText('Aucun pays de production connu.')).toBeTruthy();

    rerender(
      <MostRepresentedCountryWidget
        state="error"
        message="Erreur de lecture."
      />,
    );
    expect(screen.getByText('Erreur de lecture.')).toBeTruthy();

    rerender(<MostRepresentedCountryWidget state="error" />);
    expect(
      screen.getByText('Le pays le plus représenté est indisponible.'),
    ).toBeTruthy();
  });
});
