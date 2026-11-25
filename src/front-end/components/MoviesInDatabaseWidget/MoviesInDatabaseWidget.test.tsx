// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import MoviesInDatabaseWidget from './MoviesInDatabaseWidget';

afterEach(cleanup);

describe('MoviesInDatabaseWidget', () => {
  it('renders the number of movies when the data is ready', () => {
    // Arrange and act
    const { rerender } = render(
      <MoviesInDatabaseWidget state="ready" count={42} />,
    );

    // Assert: the widget exposes its title and count.
    expect(
      screen.getByRole('heading', { level: 2, name: 'Films en base' }),
    ).toBeTruthy();
    expect(screen.getByText('42 films disponibles en base.')).toBeTruthy();
    expect(
      screen.getByRole('article', { name: 'Widget Films en base' }),
    ).toBeTruthy();

    rerender(<MoviesInDatabaseWidget state="ready" count={1} />);
    expect(screen.getByText('1 film disponible en base.')).toBeTruthy();
  });

  it('renders each non-ready state with its matching message', () => {
    // Arrange, act, and assert
    const { rerender } = render(<MoviesInDatabaseWidget state="loading" />);
    expect(
      screen.getByText(
        'Le nombre de films en base est en cours de chargement.',
      ),
    ).toBeTruthy();

    rerender(<MoviesInDatabaseWidget state="empty" />);
    expect(
      screen.getByText('Aucun film n’est disponible en base.'),
    ).toBeTruthy();

    rerender(
      <MoviesInDatabaseWidget
        state="error"
        message="Erreur de connexion à la base."
      />,
    );
    expect(screen.getByText('Erreur de connexion à la base.')).toBeTruthy();

    rerender(<MoviesInDatabaseWidget state="error" />);
    expect(
      screen.getByText('Les films en base ne sont pas disponibles.'),
    ).toBeTruthy();
  });
});
