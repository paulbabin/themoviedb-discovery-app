// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import DashboardPage from './DashboardPage';

afterEach(cleanup);

describe('DashboardPage', () => {
  it('renders the dashboard with an empty widgets state', () => {
    // Arrange and act: render the dashboard before any widget is configured.
    render(<DashboardPage />);

    // Assert: the page remains usable and explains that no widget is available.
    expect(screen.getByRole('main')).toBeTruthy();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Tableau de bord des films',
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Widgets' }),
    ).toBeTruthy();
    expect(
      screen.getByText("Aucun widget n'est configuré pour le moment."),
    ).toBeTruthy();
  });
});
