import type { Season } from '../domain/season-snapshot';

type SeasonHeaderProps = {
  season: Season | null;
  fetchedAt: string | null;
  onRefresh: () => void;
  isRefreshing: boolean;
};

export function SeasonHeader({ season, fetchedAt, onRefresh, isRefreshing }: SeasonHeaderProps) {
  const fetchedLabel = fetchedAt === null ? 'Belum dimuat' : new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(fetchedAt));

  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">Simulator skenario playoff</p>
        <h1>Standing Generator</h1>
        <p className="season-name">{season?.name ?? 'Memuat season aktif'}</p>
        <p className="muted">Data terakhir dimuat: {fetchedLabel}</p>
      </div>
      <button className="secondary-button" type="button" onClick={onRefresh} disabled={isRefreshing}>
        {isRefreshing ? 'Memuat…' : 'Muat ulang data'}
      </button>
    </header>
  );
}
