import { useEffect, useMemo, useState } from 'react';
import { createEquipment, getEquipments } from '../api/equipmentApi';
import { getEngineers } from '../api/engineerApi';
import EquipmentCard from '../components/equipments/EquipmentCard';
import EquipmentFormModal from '../components/equipments/EquipmentFormModal';
import type { CreateEquipmentRequest, Equipment } from '../types/equipment';
import type { Engineer } from '../types/engineers';
import './EquipmentsPage.css';

export default function EquipmentsPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadPageData = async () => {
    setLoading(true);
    setError('');

    try {
      const [equipmentResponse, engineerResponse] = await Promise.all([
        getEquipments(),
        getEngineers(),
      ]);

      setEquipments(Array.isArray(equipmentResponse) ? equipmentResponse : []);
      setEngineers(Array.isArray(engineerResponse) ? engineerResponse : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load equipments.');
      setEquipments([]);
      setEngineers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPageData();
  }, []);

  const filteredEquipments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return equipments;
    }

    return equipments.filter((equipment) =>
      [equipment.name, equipment.code, equipment.assignedEngineerName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [equipments, search]);

  const activeCount = useMemo(
    () => equipments.filter((equipment) => equipment.active).length,
    [equipments],
  );

  const inactiveCount = equipments.length - activeCount;

  const assignedCount = useMemo(
    () => equipments.filter((equipment) => Boolean(equipment.assignedEngineerName)).length,
    [equipments],
  );

  const handleCreateEquipment = async (payload: CreateEquipmentRequest) => {
    try {
      setSaving(true);
      setError('');

      await createEquipment(payload);
      await loadPageData();

      setIsModalOpen(false);
    } catch (createError) {
      setError(
        createError instanceof Error ? createError.message : 'Failed to create equipment.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="equipments-page">
      <div className="equipments-page__hero">
        <div className="equipments-page__hero-main">
          <div>
            <p className="equipments-page__eyebrow">Asset administration</p>

            <h2 className="equipments-page__title">Equipments</h2>

            <p className="equipments-page__description">
              Create equipment records, define maintenance recurrence, and assign ownership
              to engineers.
            </p>
          </div>

          <button
            type="button"
            className="equipments-page__button equipments-page__button--primary"
            onClick={() => setIsModalOpen(true)}
          >
            Add equipment
          </button>
        </div>

        <div className="equipments-page__stats">
          <div className="equipments-page__stat-card">
            <span className="equipments-page__stat-label">Total</span>
            <strong className="equipments-page__stat-value">{equipments.length}</strong>
          </div>

          <div className="equipments-page__stat-card">
            <span className="equipments-page__stat-label">Active</span>
            <strong className="equipments-page__stat-value">{activeCount}</strong>
          </div>

          <div className="equipments-page__stat-card">
            <span className="equipments-page__stat-label">Assigned</span>
            <strong className="equipments-page__stat-value">{assignedCount}</strong>
          </div>

          <div className="equipments-page__stat-card">
            <span className="equipments-page__stat-label">Inactive</span>
            <strong className="equipments-page__stat-value">{inactiveCount}</strong>
          </div>
        </div>
      </div>

      <section className="equipments-page__toolbar">
        <label className="equipments-page__search">
          <span className="equipments-page__search-icon">⌕</span>

          <input
            className="equipments-page__search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search equipment, code, engineer..."
          />
        </label>

        <div className="equipments-page__toolbar-meta">
          <span className="equipments-page__results-count">
            {filteredEquipments.length} result{filteredEquipments.length === 1 ? '' : 's'}
          </span>

          {search.trim() ? (
            <button
              type="button"
              className="equipments-page__button equipments-page__button--ghost"
              onClick={() => setSearch('')}
            >
              Clear
            </button>
          ) : null}
        </div>
      </section>

      {error ? <div className="equipments-page__alert">{error}</div> : null}

      {loading ? (
        <section className="equipments-page__state-card">
          <div className="equipments-page__state-icon">⋯</div>
          <h3>Loading equipments...</h3>
          <p>Please wait while equipment records are being retrieved.</p>
        </section>
      ) : filteredEquipments.length === 0 ? (
        <section className="equipments-page__state-card">
          <div className="equipments-page__state-icon">◌</div>
          <h3>{search.trim() ? 'No matching equipments' : 'No equipments yet'}</h3>
          <p>
            {search.trim()
              ? 'Try another search term or clear the filter.'
              : 'Create your first equipment record to start automated planning.'}
          </p>
        </section>
      ) : (
        <section className="equipments-page__grid">
          {filteredEquipments.map((equipment) => (
            <EquipmentCard key={equipment.id} equipment={equipment} />
          ))}
        </section>
      )}

      <EquipmentFormModal
        open={isModalOpen}
        engineers={engineers}
        loading={saving}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateEquipment}
      />
    </section>
  );
}