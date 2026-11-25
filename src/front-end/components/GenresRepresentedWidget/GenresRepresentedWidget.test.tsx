// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { GenresRepresentedWidgetData } from '../../../back-end/types/MoviesTypes';
import GenresRepresentedWidget from './GenresRepresentedWidget';

afterEach(cleanup);

describe('GenresRepresentedWidget', () => {
  it('renders the widget labels and the supplied distinct genre count', () => {
    // Arrange: the data layer supplies the distinct genre total.
    const data: GenresRepresentedWidgetData = { genre_count: 19 };

    // Act
    render(<GenresRepresentedWidget state="ready" data={data} />);

    // Assert: the widget displays its labels and the count with its unit.
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Genres représentés',
      }),
    ).toBeTruthy();
    expect(screen.getByText('Diversité du catalogue')).toBeTruthy();
    expect(screen.getByText('19 genres')).toBeTruthy();
    expect(screen.getByText('19 genres').getAttribute('aria-label')).toBe(
      'Nombre de genres représentés : 19 genres',
    );
  });

  it('displays zero genres as a valid count', () => {
    // Arrange: zero means that the catalog contains no distinct genres.
    const data: GenresRepresentedWidgetData = { genre_count: 0 };

    // Act
    render(<GenresRepresentedWidget state="ready" data={data} />);

    // Assert: zero is accompanied by the genre unit.
    expect(screen.getByText('0 genres')).toBeTruthy();
    expect(screen.queryByText('Non renseigné')).toBeNull();
  });

  it('uses the singular unit when exactly one genre is represented', () => {
    // Arrange: one distinct genre uses the singular French unit.
    const data: GenresRepresentedWidgetData = { genre_count: 1 };

    // Act
    render(<GenresRepresentedWidget state="ready" data={data} />);

    // Assert
    expect(screen.getByText('1 genre')).toBeTruthy();
  });

  it('displays an unknown count without treating it as zero', () => {
    // Arrange: null means that the distinct count is unavailable.
    const data: GenresRepresentedWidgetData = { genre_count: null };

    // Act
    render(<GenresRepresentedWidget state="ready" data={data} />);

    // Assert: the unknown value is distinct from a valid zero.
    expect(screen.getByText('Non renseigné')).toBeTruthy();
    expect(screen.queryByText('0 genres')).toBeNull();
  });

  it('renders loading and error states', () => {
    // Arrange and act: render each mutually exclusive state.
    const { rerender } = render(<GenresRepresentedWidget state="loading" />);
    expect(screen.getByRole('status').textContent).toContain('Chargement');
    expect(screen.getByRole('article').getAttribute('aria-busy')).toBe('true');

    rerender(<GenresRepresentedWidget state="error" />);
    expect(screen.getByRole('alert').textContent).toContain('Impossible');
  });
});
