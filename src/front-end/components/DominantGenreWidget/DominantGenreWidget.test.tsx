// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { DominantGenreWidgetData } from '../../../back-end/types/MoviesTypes';
import DominantGenreWidget from './DominantGenreWidget';

afterEach(cleanup);

describe('DominantGenreWidget', () => {
  it('renders the provided dominant genre and movie count', () => {
    // Arrange: the data layer supplies the dominant genre and its movie total.
    const data: DominantGenreWidgetData = {
      genre_name: 'Drame',
      movie_count: 322,
    };

    // Act
    render(<DominantGenreWidget state="ready" data={data} />);

    // Assert: the widget displays the supplied name and count with its unit.
    expect(
      screen.getByRole('heading', { level: 2, name: 'Genre dominant' }),
    ).toBeTruthy();
    expect(screen.getByText('Drame')).toBeTruthy();
    expect(screen.getByText('322 films')).toBeTruthy();
  });

  it('keeps long genre names readable by rendering the full value', () => {
    // Arrange: the genre name is longer than a typical category label.
    const longGenreName = 'Science-fiction et aventures intergalactiques';
    const data: DominantGenreWidgetData = {
      genre_name: longGenreName,
      movie_count: 1,
    };

    // Act
    render(<DominantGenreWidget state="ready" data={data} />);

    // Assert: the complete genre name is preserved, with singular unit.
    expect(screen.getByText(longGenreName)).toBeTruthy();
    expect(screen.getByText('1 film')).toBeTruthy();
  });

  it('displays incomplete results without inventing a genre or count', () => {
    // Arrange: the genre name and movie count are both unknown.
    const data: DominantGenreWidgetData = {
      genre_name: null,
      movie_count: null,
    };

    // Act
    render(<DominantGenreWidget state="ready" data={data} />);

    // Assert: missing values are identified rather than rendered as zero.
    expect(screen.getByText('Genre inconnu')).toBeTruthy();
    expect(screen.getByText('Effectif inconnu')).toBeTruthy();
    expect(screen.queryByText('0 films')).toBeNull();
  });

  it('renders the no-known-genre, loading, and error states', () => {
    // Arrange and act: render each mutually exclusive widget state.
    const { rerender } = render(<DominantGenreWidget state="empty" />);
    expect(screen.getByText('Aucun genre connu.')).toBeTruthy();

    rerender(<DominantGenreWidget state="loading" />);
    expect(screen.getByRole('status').textContent).toContain('Chargement');
    expect(screen.getByRole('article').getAttribute('aria-busy')).toBe('true');

    rerender(<DominantGenreWidget state="error" />);
    expect(screen.getByRole('alert').textContent).toContain('Impossible');
  });
});
