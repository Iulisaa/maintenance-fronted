import { useEffect, useMemo, useState } from 'react';
import EngineerCard from '../components/engineer/EngineerCard';
import EngineerFormModal from '../components/engineer/EngineerFormModal';
import { createEngineer, getEngineers } from '../api/engineerApi';
import type { CreateEngineerRequest, Engineer } from '../types/engineers';
import './EngineersPage.css';

export default function EngineersPage() {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setError('');
      setLoading(true);

      const data = await getEngineers();
      setEngineers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load engineers.');
      setEngineers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCreateEngineer = async (payload: CreateEngineerRequest) => {
    try {
      setSaving(true);
      setError('');

      await createEngineer(payload);
      await loadData();

      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create engineer.');
    } finally {
      setSaving(false);
    }
  };

  const filteredEngineers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return engineers;
    }

    return engineers.filter((engineer) =>
      [engineer.name, engineer.email].join(' ').toLowerCase().includes(query),
    );
  }, [engineers, search]);

  const activeCount = useMemo(
    () => engineers.filter((engineer) => engineer.active).length,
    [engineers],
  );

  const inactiveCount = engineers.length - activeCount;

return (
  <section className="engineers-page">
    <div className="engineers-page__hero">
      <div className="engineers-page__hero-content">
        <div className="engineers-page__hero-copy">
          <p className="engineers-page__eyebrow">Workforce Management</p>

          <h2 className="engineers-page__title">Engineers</h2>

          <p className="engineers-page__subtitle">
            Manage the engineers available for inspection planning, task allocation,
            and field operations.
          </p>
        </div>

        <div className="engineers-page__hero-actions">
          <button
            type="button"
            className="engineers-page__button engineers-page__button--primary"
            onClick={() => setModalOpen(true)}
          >
            Add engineer
          </button>
        </div>
      </div>

      <div className="engineers-page__stats">
        <div className="engineers-page__stat-card">
          <span className="engineers-page__stat-label">Total engineers</span>
          <strong className="engineers-page__stat-value">{engineers.length}</strong>
        </div>

        <div className="engineers-page__stat-card">
          <span className="engineers-page__stat-label">Active</span>
          <strong className="engineers-page__stat-value">{activeCount}</strong>
        </div>

        <div className="engineers-page__stat-card">
          <span className="engineers-page__stat-label">Inactive</span>
          <strong className="engineers-page__stat-value">{inactiveCount}</strong>
        </div>
      </div>
    </div>

    <section className="engineers-page__toolbar">
      <label className="engineers-page__search">
        <span className="engineers-page__search-icon">⌕</span>

        <input
          type="text"
          placeholder="Search engineers..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="engineers-page__search-input"
        />
      </label>

      <div className="engineers-page__toolbar-meta">
        <span className="engineers-page__results-count">
          {filteredEngineers.length} result{filteredEngineers.length === 1 ? '' : 's'}
        </span>

        {search.trim() && (
          <button
            type="button"
            className="engineers-page__button engineers-page__button--ghost"
            onClick={() => setSearch('')}
          >
            Clear
          </button>
        )}
      </div>
    </section>

    {error && <div className="engineers-page__alert">{error}</div>}

    {loading ? (
      <section className="engineers-page__state-card">
        <div className="engineers-page__state-icon">⋯</div>
        <h3>Loading engineers</h3>
        <p>Please wait while we load the engineer list.</p>
      </section>
    ) : filteredEngineers.length === 0 ? (
      <section className="engineers-page__state-card">
        <div className="engineers-page__state-icon">◌</div>
        <h3>{search.trim() ? 'No matching engineers' : 'No engineers yet'}</h3>
        <p>
          {search.trim()
            ? 'Try another search term or clear the filter.'
            : 'Create your first engineer to start planning inspections.'}
        </p>
      </section>
    ) : (
      <section className="engineers-page__cards-grid">
        {filteredEngineers.map((engineer) => (
          <EngineerCard key={engineer.id} engineer={engineer} />
        ))}
      </section>
    )}

    <EngineerFormModal
      open={modalOpen}
      loading={saving}
      onClose={() => setModalOpen(false)}
      onSubmit={handleCreateEngineer}
    />
  </section>
);
}