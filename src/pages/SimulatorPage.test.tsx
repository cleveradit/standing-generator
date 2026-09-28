import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SeasonSnapshot } from '../domain/season-snapshot';
import { SimulatorPage } from './SimulatorPage';
import { getSeasonSnapshot } from '../services/season-api';

vi.mock('../services/season-api', () => ({ getSeasonSnapshot: vi.fn() }));
const mockedGetSeasonSnapshot = vi.mocked(getSeasonSnapshot);

const snapshot: SeasonSnapshot = {
  fetchedAt: '2026-09-21T00:00:00Z',
  season: {
    id: 'season', providerId: 'season', name: 'MPL Test Season', startsAt: null, endsAt: null,
    rules: { regularSeasonBestOf: 3, playoffCutoff: 2, upperBracketCutoff: 1, tiebreakers: ['match_wins', 'game_difference', 'head_to_head'] },
  },
  teams: [
    { id: 'a', providerId: 'a', name: 'Team A', acronym: 'A', logoUrl: null },
    { id: 'b', providerId: 'b', name: 'Team B', acronym: 'B', logoUrl: null },
  ],
  matches: [{
    id: 'match', providerId: 'match', seasonId: 'season', tournamentId: 'regular', tournamentName: 'Regular Season',
    homeTeamId: 'a', awayTeamId: 'b', scheduledAt: '2026-09-21T10:00:00Z', status: 'scheduled', bestOf: 3,
    scoreline: null, isRegularSeason: true,
  }],
};

describe('SimulatorPage', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders the dashboard and updates a local scenario lock', async () => {
    mockedGetSeasonSnapshot.mockResolvedValue(snapshot);
    render(<SimulatorPage />);

    expect(await screen.findByText('MPL Test Season')).toBeInTheDocument();
    const scoreButton = screen.getByRole('button', { name: '2-0' });
    fireEvent.click(scoreButton);
    await waitFor(() => expect(scoreButton).toHaveAttribute('aria-pressed', 'true'));
    fireEvent.click(screen.getByRole('button', { name: 'Reset skenario' }));
    expect(screen.getByRole('button', { name: '?' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders a safe retry state when the gateway fails', async () => {
    mockedGetSeasonSnapshot.mockRejectedValue(new Error('Database lokal belum dapat memuat season aktif.'));
    render(<SimulatorPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Database lokal belum dapat memuat season aktif.');
    expect(screen.getByRole('button', { name: 'Coba lagi' })).toBeInTheDocument();
  });
});
