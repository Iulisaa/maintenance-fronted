import { type FormEvent, useEffect, useMemo, useState } from 'react';
import type { Engineer } from '../../types/engineers';
import type {
  CreateEquipmentRequest,
  Equipment,
  EquipmentSeasonType,
} from '../../types/equipment';
import type { EquipmentCategory } from '../../types/equipmentCategory';
import './EquipmentFormModal.css';

interface EquipmentFormModalProps {
  open: boolean;
  equipment?: Equipment | null;
  engineers: Engineer[];
  categories: EquipmentCategory[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateEquipmentRequest) => Promise<void>;
}

const defaultActiveMonthsBySeason: Record<EquipmentSeasonType, number[]> = {
  HEAT: [10, 11, 12, 1, 2, 3],
  COLD: [5, 6, 7, 8, 9],
  UNIVERSAL: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};

const monthOptions = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
];

const initialForm: CreateEquipmentRequest = {
  name: '',
  code: '',
  active: true,
  seasonType: 'HEAT',
  frequencyPerYear: 1,
  estimatedDurationMinutes: 60,
  serialNumber: '',
  notes: '',
  defaultEngineerId: null,
  activeMonths: defaultActiveMonthsBySeason.HEAT,
  categoryId: '',
};

export default function EquipmentFormModal({
  open,
  equipment,
  engineers,
  categories,
  loading,
  onClose,
  onSubmit,
}: EquipmentFormModalProps) {
  const [form, setForm] = useState<CreateEquipmentRequest>(initialForm);
  const [error, setError] = useState('');

  const isEditMode = Boolean(equipment);
  const selectedEngineerId = equipment?.defaultEngineer?.id ?? null;

  const availableEngineers = useMemo(() => {
    const activeEngineers = engineers.filter((engineer) => engineer.active);

    if (!selectedEngineerId) {
      return activeEngineers;
    }

    const selectedEngineerExists = activeEngineers.some(
      (engineer) => engineer.id === selectedEngineerId,
    );

    if (selectedEngineerExists) {
      return activeEngineers;
    }

    const selectedEngineer = engineers.find(
      (engineer) => engineer.id === selectedEngineerId,
    );

    return selectedEngineer
      ? [selectedEngineer, ...activeEngineers]
      : activeEngineers;
  }, [engineers, selectedEngineerId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (equipment) {
      setForm({
        name: equipment.name ?? '',
        code: equipment.code ?? '',
        active: equipment.active,
        seasonType: equipment.seasonType,
        frequencyPerYear: equipment.frequencyPerYear,
        estimatedDurationMinutes: equipment.estimatedDurationMinutes,
        serialNumber: equipment.serialNumber ?? '',
        notes: equipment.notes ?? '',
        defaultEngineerId: equipment.defaultEngineer?.id ?? null,
        activeMonths:
          equipment.activeMonths && equipment.activeMonths.length > 0
            ? [...equipment.activeMonths].sort((a, b) => a - b)
            : defaultActiveMonthsBySeason[equipment.seasonType],
        categoryId: equipment.categoryId ?? '',
      });

      setError('');
      return;
    }

    setForm({
      ...initialForm,
      categoryId: categories[0]?.id ?? '',
    });

    setError('');
  }, [open, equipment, categories]);

  if (!open) {
    return null;
  }

  const handleClose = () => {
    if (loading) {
      return;
    }

    setForm(initialForm);
    setError('');
    onClose();
  };

  const handleChange = <K extends keyof CreateEquipmentRequest>(
    field: K,
    value: CreateEquipmentRequest[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSeasonChange = (seasonType: EquipmentSeasonType) => {
    setForm((previous) => ({
      ...previous,
      seasonType,
      activeMonths: defaultActiveMonthsBySeason[seasonType],
    }));
  };

  const handleMonthToggle = (month: number) => {
    setForm((previous) => {
      const currentMonths = previous.activeMonths ?? [];
      const exists = currentMonths.includes(month);

      const nextMonths = exists
        ? currentMonths.filter((value) => value !== month)
        : [...currentMonths, month];

      return {
        ...previous,
        activeMonths: nextMonths.sort((a, b) => a - b),
      };
    });
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      setError('Equipment name is required.');
      return false;
    }

    if (!form.code.trim()) {
      setError('Equipment code is required.');
      return false;
    }

    if (!form.categoryId) {
      setError('Equipment category is required.');
      return false;
    }

    if (form.frequencyPerYear <= 0) {
      setError('Frequency per year must be greater than zero.');
      return false;
    }

    if (form.estimatedDurationMinutes <= 0) {
      setError('Estimated duration must be greater than zero.');
      return false;
    }

    if (!form.activeMonths.length) {
      setError('Please select at least one active month.');
      return false;
    }

    return true;
  };

  const getEngineerLabel = (engineer: Engineer): string => {
    return engineer.name || engineer.email;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        name: form.name.trim(),
        code: form.code.trim(),
        active: form.active,
        seasonType: form.seasonType,
        frequencyPerYear: form.frequencyPerYear,
        estimatedDurationMinutes: form.estimatedDurationMinutes,
        serialNumber: form.serialNumber?.trim() || null,
        notes: form.notes?.trim() || null,
        defaultEngineerId: form.defaultEngineerId || null,
        activeMonths: form.activeMonths,
        categoryId: form.categoryId,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Failed to save equipment.',
      );
    }
  };

  return (
    <div
      className="equipment-form-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="equipment-form-modal-title"
    >
      <button
        type="button"
        className="equipment-form-modal__backdrop"
        onClick={handleClose}
        disabled={loading}
        aria-label="Close modal"
      />

      <div className="equipment-form-modal__card">
        <header className="equipment-form-modal__header">
          <div>
            <p className="equipment-form-modal__eyebrow">Equipment</p>

            <h2
              id="equipment-form-modal-title"
              className="equipment-form-modal__title"
            >
              {isEditMode ? 'Edit equipment' : 'Add equipment'}
            </h2>

            <p className="equipment-form-modal__description">
              {isEditMode
                ? 'Update the inspection profile, category, preferred engineer, schedule frequency, and active service months.'
                : 'Configure the inspection profile, category, preferred engineer, schedule frequency, and active service months.'}
            </p>
          </div>

          <button
            type="button"
            className="equipment-form-modal__close-button"
            onClick={handleClose}
            disabled={loading}
            aria-label="Close modal"
          >
            ×
          </button>
        </header>

        <form className="equipment-form-modal__form" onSubmit={handleSubmit}>
          {error && <div className="equipment-form-modal__alert">{error}</div>}

          <div className="equipment-form-modal__grid">
            <label className="equipment-form-modal__field">
              <span className="equipment-form-modal__label">
                Equipment name
              </span>

              <input
                className="equipment-form-modal__input"
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                placeholder="Boiler 01"
                disabled={loading}
                autoFocus
              />
            </label>

            <label className="equipment-form-modal__field">
              <span className="equipment-form-modal__label">
                Equipment code
              </span>

              <input
                className="equipment-form-modal__input"
                value={form.code}
                onChange={(event) => handleChange('code', event.target.value)}
                placeholder="BLR-001"
                disabled={loading}
              />
            </label>

            <label className="equipment-form-modal__field">
              <span className="equipment-form-modal__label">Category</span>

              <select
                className="equipment-form-modal__select"
                value={form.categoryId}
                onChange={(event) =>
                  handleChange('categoryId', event.target.value)
                }
                disabled={loading || categories.length === 0}
              >
                {categories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>

              <small className="equipment-form-modal__hint">
                Used to group equipment in the asset page.
              </small>
            </label>

            <label className="equipment-form-modal__field equipment-form-modal__field--category">
              <span className="equipment-form-modal__label">
                Default engineer
              </span>

              <select
                className="equipment-form-modal__select"
                value={form.defaultEngineerId ?? ''}
                onChange={(event) =>
                  handleChange('defaultEngineerId', event.target.value || null)
                }
                disabled={loading}
              >
                <option value="">No default engineer</option>

                {availableEngineers.map((engineer) => (
                  <option
                    key={engineer.id ?? engineer.email}
                    value={engineer.id ?? ''}
                  >
                    {getEngineerLabel(engineer)}
                    {!engineer.active ? ' (inactive)' : ''}
                  </option>
                ))}
              </select>

              <small className="equipment-form-modal__hint">
                The planner can use this engineer as the preferred assignee.
              </small>
            </label>

            <label className="equipment-form-modal__field">
              <span className="equipment-form-modal__label">Season type</span>

              <select
                className="equipment-form-modal__select"
                value={form.seasonType}
                onChange={(event) =>
                  handleSeasonChange(event.target.value as EquipmentSeasonType)
                }
                disabled={loading}
              >
                <option value="HEAT">Heating</option>
                <option value="COLD">Cooling</option>
                <option value="UNIVERSAL">Universal</option>
              </select>

              <small className="equipment-form-modal__hint">
                Changing the season updates the default active months.
              </small>
            </label>

            <label className="equipment-form-modal__field">
              <span className="equipment-form-modal__label">
                Frequency / year
              </span>

              <input
                className="equipment-form-modal__input"
                type="number"
                min={1}
                value={form.frequencyPerYear}
                onChange={(event) =>
                  handleChange('frequencyPerYear', Number(event.target.value))
                }
                disabled={loading}
              />
            </label>

            <label className="equipment-form-modal__field">
              <span className="equipment-form-modal__label">
                Estimated duration
              </span>

              <input
                className="equipment-form-modal__input"
                type="number"
                min={1}
                value={form.estimatedDurationMinutes}
                onChange={(event) =>
                  handleChange(
                    'estimatedDurationMinutes',
                    Number(event.target.value),
                  )
                }
                disabled={loading}
              />

              <small className="equipment-form-modal__hint">
                Duration in minutes.
              </small>
            </label>

            <label className="equipment-form-modal__field">
              <span className="equipment-form-modal__label">
                Serial number
              </span>

              <input
                className="equipment-form-modal__input"
                value={form.serialNumber ?? ''}
                onChange={(event) =>
                  handleChange('serialNumber', event.target.value)
                }
                placeholder="Optional"
                disabled={loading}
              />
            </label>

            <label className="equipment-form-modal__field equipment-form-modal__field--wide">
              <span className="equipment-form-modal__label">
                Active months
              </span>

              <div className="equipment-form-modal__month-grid">
                {monthOptions.map((month) => {
                  const selected = form.activeMonths.includes(month.value);

                  return (
                    <button
                      key={month.value}
                      type="button"
                      className={
                        selected
                          ? 'equipment-form-modal__month equipment-form-modal__month--selected'
                          : 'equipment-form-modal__month'
                      }
                      onClick={() => handleMonthToggle(month.value)}
                      disabled={loading}
                    >
                      {month.label}
                    </button>
                  );
                })}
              </div>

              <small className="equipment-form-modal__hint">
                Select the months when this equipment should be included in
                planning.
              </small>
            </label>

            <label className="equipment-form-modal__field equipment-form-modal__field--wide">
              <span className="equipment-form-modal__label">Notes</span>

              <textarea
                className="equipment-form-modal__textarea"
                value={form.notes ?? ''}
                onChange={(event) => handleChange('notes', event.target.value)}
                placeholder="Optional equipment notes"
                disabled={loading}
                rows={4}
              />
            </label>
          </div>

          <label className="equipment-form-modal__toggle-row">
            <div>
              <span className="equipment-form-modal__toggle-title">
                Active
              </span>

              <small className="equipment-form-modal__toggle-description">
                Inactive equipment will not be considered by the planner.
              </small>
            </div>

            <span className="equipment-form-modal__switch">
              <input
                className="equipment-form-modal__switch-input"
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  handleChange('active', event.target.checked)
                }
                disabled={loading}
              />

              <span className="equipment-form-modal__switch-track">
                <span className="equipment-form-modal__switch-thumb" />
              </span>
            </span>
          </label>

          <footer className="equipment-form-modal__actions">
            <button
              type="button"
              className="equipment-form-modal__button equipment-form-modal__button--secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="equipment-form-modal__button equipment-form-modal__button--primary"
              disabled={loading || categories.length === 0}
            >
              {loading && <span className="equipment-form-modal__spinner" />}

              {loading
                ? 'Saving…'
                : isEditMode
                  ? 'Save changes'
                  : 'Create equipment'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}