import { type FormEvent, useEffect, useState } from 'react';
import type { Engineer } from '../../types/engineers';
import type { CreateEquipmentRequest } from '../../types/equipment';
import './EquipmentFormModal.css';

interface EquipmentFormModalProps {
  open: boolean;
  engineers: Engineer[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateEquipmentRequest) => Promise<void>;
}

const initialForm: CreateEquipmentRequest = {
  name: '',
  code: '',
  active: true,
  seasonType: 'HEAT',
  serialNumber: '',
  notes: '',
  assignedEngineerId: '',
  recurrencePerYear: 1,
  estimatedDurationMinutes: 60,
  reportTemplateCode: 'DEFAULT',
};

export default function EquipmentFormModal({
  open,
  engineers,
  loading,
  onClose,
  onSubmit,
}: EquipmentFormModalProps) {
  const [form, setForm] = useState<CreateEquipmentRequest>(initialForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setError('');
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const activeEngineers = engineers.filter((engineer) => engineer.active);

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
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Equipment name is required.');
      return;
    }

    if (!form.code.trim()) {
      setError('Equipment code is required.');
      return;
    }

    if (!form.assignedEngineerId) {
      setError('Please select an engineer.');
      return;
    }

    if (form.recurrencePerYear <= 0) {
      setError('Recurrence per year must be greater than zero.');
      return;
    }

    if (form.estimatedDurationMinutes <= 0) {
      setError('Estimated duration must be greater than zero.');
      return;
    }

    try {
      await onSubmit({
        ...form,
        name: form.name.trim(),
        code: form.code.trim(),
        serialNumber: form.serialNumber?.trim() || null,
        notes: form.notes?.trim() || null,
      });

      handleClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Failed to save equipment.',
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
      <div className="equipment-form-modal__card">
        <header className="equipment-form-modal__header">
          <div>
            <p className="equipment-form-modal__eyebrow">Create record</p>

            <h2 id="equipment-form-modal-title" className="equipment-form-modal__title">
              Add equipment
            </h2>

            <p className="equipment-form-modal__description">
              Define the equipment details and maintenance planning rules.
            </p>
          </div>

          <button
            type="button"
            className="equipment-form-modal__close-button"
            onClick={handleClose}
            disabled={loading}
          >
            Close
          </button>
        </header>

        <form className="equipment-form-modal__form" onSubmit={handleSubmit}>
          {error ? <div className="equipment-form-modal__alert">{error}</div> : null}

          <div className="equipment-form-modal__grid">
            <label className="equipment-form-modal__field">
              <span className="equipment-form-modal__label">Equipment name</span>

              <input
                className="equipment-form-modal__input"
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                placeholder="Boiler 01"
                disabled={loading}
              />
            </label>

            <label className="equipment-form-modal__field">
              <span className="equipment-form-modal__label">Equipment code</span>

              <input
                className="equipment-form-modal__input"
                value={form.code}
                onChange={(event) => handleChange('code', event.target.value)}
                placeholder="BLR-001"
                disabled={loading}
              />
            </label>

            <label className="equipment-form-modal__field">
              <span className="equipment-form-modal__label">Recurrence / year</span>

              <input
                className="equipment-form-modal__input"
                type="number"
                min={1}
                value={form.recurrencePerYear}
                onChange={(event) =>
                  handleChange('recurrencePerYear', Number(event.target.value))
                }
                disabled={loading}
              />
            </label>

            <label className="equipment-form-modal__field">
              <span className="equipment-form-modal__label">Assigned engineer</span>

              <select
                className="equipment-form-modal__select"
                value={form.assignedEngineerId}
                onChange={(event) => handleChange('assignedEngineerId', event.target.value)}
                disabled={loading || activeEngineers.length === 0}
              >
                <option value="">
                  {activeEngineers.length === 0 ? 'No active engineers available' : 'Select engineer'}
                </option>

                {activeEngineers.map((engineer) => (
                  <option key={engineer.id} value={engineer.id}>
                    {engineer.fullName}
                  </option>
                ))}
              </select>
            </label>

            <label className="equipment-form-modal__field">
              <span className="equipment-form-modal__label">Season type</span>

              <select
                className="equipment-form-modal__select"
                value={form.seasonType}
                onChange={(event) =>
                  handleChange(
                    'seasonType',
                    event.target.value as CreateEquipmentRequest['seasonType'],
                  )
                }
                disabled={loading}
              >
                <option value="HEAT">Heat</option>
                <option value="COLD">Cold</option>
                <option value="UNIVERSAL">Universal</option>
              </select>

              <small className="equipment-form-modal__hint">
                The scheduling months are calculated automatically by the backend.
              </small>
            </label>
          </div>

         <label className="equipment-form-modal__toggle-row">
  <div>
    <span className="equipment-form-modal__toggle-title">Active</span>
    <small className="equipment-form-modal__toggle-description">
      Inactive equipment will not be considered by the planner.
    </small>
  </div>

  <span className="equipment-form-modal__switch">
    <input
      className="equipment-form-modal__switch-input"
      type="checkbox"
      checked={form.active}
      onChange={(event) => handleChange('active', event.target.checked)}
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
              disabled={loading}
            >
              {loading ? <span className="equipment-form-modal__spinner" /> : null}
              {loading ? 'Saving…' : 'Save equipment'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}