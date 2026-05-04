import { useEffect, useMemo, useState } from 'react';
import {
  createEquipment,
  getEquipments,
  updateEquipment,
} from '../api/equipmentApi';
import { getEngineers } from '../api/engineerApi';
import { getEquipmentCategories } from '../api/equipmentCategoryApi';
import EquipmentCard from '../components/equipments/EquipmentCard';
import EquipmentFormModal from '../components/equipments/EquipmentFormModal';
import type { CreateEquipmentRequest, Equipment } from '../types/equipment';
import type { EquipmentCategory } from '../types/equipmentCategory';
import type { Engineer } from '../types/engineers';
import './EquipmentsPage.css';

export default function EquipmentsPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [savingEquipment, setSavingEquipment] = useState(false);
  const [error, setError] = useState('');

  const loadPageData = async () => {
    setLoading(true);
    setError('');

    try {
      const [equipmentResponse, engineerResponse, categoryResponse] =
        await Promise.all([
          getEquipments(),
          getEngineers(),
          getEquipmentCategories(),
        ]);

      setEquipments(Array.isArray(equipmentResponse) ? equipmentResponse : []);
      setEngineers(Array.isArray(engineerResponse) ? engineerResponse : []);
      setCategories(Array.isArray(categoryResponse) ? categoryResponse : []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load equipment.',
      );

      setEquipments([]);
      setEngineers([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPageData();
  }, []);

  const filteredEquipments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return equipments.filter((equipment) => {
      const matchesCategory =
        selectedCategoryId === 'all' ||
        equipment.categoryId === selectedCategoryId;

      const matchesSearch =
        !query ||
        [
          equipment.name,
          equipment.code,
          equipment.categoryName,
          equipment.defaultEngineer?.fullName,
          equipment.defaultEngineer?.email,
          equipment.seasonType,
          String(equipment.frequencyPerYear),
          String(equipment.estimatedDurationMinutes),
          equipment.serialNumber,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [equipments, selectedCategoryId, search]);

  const activeCount = useMemo(
    () => equipments.filter((equipment) => equipment.active).length,
    [equipments],
  );

  const inactiveCount = equipments.length - activeCount;

  const assignedCount = useMemo(
    () =>
      equipments.filter((equipment) => Boolean(equipment.defaultEngineer))
        .length,
    [equipments],
  );

  const universalCount = useMemo(
    () =>
      equipments.filter((equipment) => equipment.seasonType === 'UNIVERSAL')
        .length,
    [equipments],
  );

  const selectedCategoryName = useMemo(() => {
    if (selectedCategoryId === 'all') {
      return 'All categories';
    }

    return (
      categories.find((category) => category.id === selectedCategoryId)?.name ??
      'Selected category'
    );
  }, [categories, selectedCategoryId]);

  const openCreateModal = () => {
    setEditingEquipment(null);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (savingEquipment) {
      return;
    }

    setModalOpen(false);
    setEditingEquipment(null);
  };

  const handleSubmitEquipment = async (payload: CreateEquipmentRequest) => {
    try {
      setSavingEquipment(true);
      setError('');

      if (editingEquipment) {
        await updateEquipment(editingEquipment.id, payload);
      } else {
        await createEquipment(payload);
      }

      await loadPageData();

      setModalOpen(false);
      setEditingEquipment(null);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : editingEquipment
            ? 'Failed to update equipment.'
            : 'Failed to create equipment.',
      );
    } finally {
      setSavingEquipment(false);
    }
  };

  return (
    <section className="equipments-page">
      <div className="equipments-page__header">
        <div className="equipments-page__header-main">
          <div className="equipments-page__heading">
            <p className="equipments-page__eyebrow">Asset administration</p>

            <h2 className="equipments-page__title">Equipment</h2>

            <p className="equipments-page__description">
              Maintain equipment records, inspection frequency, active months,
              categories, and default engineer ownership.
            </p>
          </div>

          <div className="equipments-page__header-actions">
            <button
              type="button"
              className="equipments-page__button equipments-page__button--primary"
              onClick={openCreateModal}
            >
              Add equipment
            </button>
          </div>
        </div>

        <div className="equipments-page__stats">
          <div className="equipments-page__stat-card">
            <span className="equipments-page__stat-label">Current view</span>
            <strong className="equipments-page__stat-value equipments-page__stat-value--text">
              {selectedCategoryName}
            </strong>
          </div>

          <div className="equipments-page__stat-card">
            <span className="equipments-page__stat-label">Total equipment</span>
            <strong className="equipments-page__stat-value">
              {equipments.length}
            </strong>
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
            <span className="equipments-page__stat-label">Universal</span>
            <strong className="equipments-page__stat-value">
              {universalCount}
            </strong>
          </div>

          <div className="equipments-page__stat-card">
            <span className="equipments-page__stat-label">Inactive</span>
            <strong className="equipments-page__stat-value">
              {inactiveCount}
            </strong>
          </div>
        </div>
      </div>

      <section
        className="equipments-page__categories"
        aria-label="Equipment categories"
      >
        <div className="equipments-page__categories-header">
          <span className="equipments-page__categories-title">Categories</span>

          {selectedCategoryId !== 'all' && (
            <button
              type="button"
              className="equipments-page__categories-reset"
              onClick={() => setSelectedCategoryId('all')}
            >
              Reset
            </button>
          )}
        </div>

        <div className="equipments-page__categories-scroll">
          <button
            type="button"
            className={
              selectedCategoryId === 'all'
                ? 'equipments-page__category-chip equipments-page__category-chip--active'
                : 'equipments-page__category-chip'
            }
            onClick={() => setSelectedCategoryId('all')}
          >
            All equipment
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={
                selectedCategoryId === category.id
                  ? 'equipments-page__category-chip equipments-page__category-chip--active'
                  : 'equipments-page__category-chip'
              }
              onClick={() => setSelectedCategoryId(category.id)}
              title={category.name}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      <section className="equipments-page__toolbar">
        <label className="equipments-page__search">
          <span className="equipments-page__search-icon">⌕</span>

          <input
            className="equipments-page__search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search equipment..."
          />
        </label>

        <div className="equipments-page__toolbar-meta">
          <span className="equipments-page__results-count">
            {filteredEquipments.length} result
            {filteredEquipments.length === 1 ? '' : 's'}
          </span>

          {search.trim() && (
            <button
              type="button"
              className="equipments-page__button equipments-page__button--ghost"
              onClick={() => setSearch('')}
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {error && <div className="equipments-page__alert">{error}</div>}

      {loading ? (
        <section className="equipments-page__state-card">
          <div className="equipments-page__state-icon">⋯</div>
          <h3>Loading equipment</h3>
          <p>Please wait while equipment records are being retrieved.</p>
        </section>
      ) : filteredEquipments.length === 0 ? (
        <section className="equipments-page__state-card">
          <div className="equipments-page__state-icon">◌</div>
          <h3>
            {search.trim() ? 'No matching equipment' : 'No equipment found'}
          </h3>
          <p>
            {search.trim()
              ? 'Try another search term or clear the filter.'
              : selectedCategoryId === 'all'
                ? 'Create your first equipment record to start automated planning.'
                : 'This category does not contain any equipment yet.'}
          </p>
        </section>
      ) : (
        <section className="equipments-page__grid">
          {filteredEquipments.map((equipment) => (
            <EquipmentCard
              key={equipment.id}
              equipment={equipment}
              onEdit={openEditModal}
            />
          ))}
        </section>
      )}

      <EquipmentFormModal
        open={modalOpen}
        equipment={editingEquipment}
        engineers={engineers}
        categories={categories}
        loading={savingEquipment}
        onClose={closeModal}
        onSubmit={handleSubmitEquipment}
      />
    </section>
  );
}