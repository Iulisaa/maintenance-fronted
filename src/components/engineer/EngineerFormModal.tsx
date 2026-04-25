import { type FormEvent, useState } from 'react';
import type { CreateEngineerRequest } from '../../types/engineers';
import './EngineerFormModal.css';

type Props = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateEngineerRequest) => Promise<void>;
};

const initialForm: CreateEngineerRequest = {
  fullName: '',
  email: '',
  active: true,
  maxTasksPerDay: 5,
};

export default function EngineerFormModal({
  open,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<CreateEngineerRequest>(initialForm);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleClose = () => {
    if (loading) return;

    setForm(initialForm);
    setError('');
    onClose();
  };

  const handleChange = (
    field: keyof CreateEngineerRequest,
    value: string | number | boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!form.fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!form.email.trim()) {
      setError('Email is required.');
      return;
    }

    if (form.maxTasksPerDay <= 0) {
      setError('Max tasks per day must be greater than 0.');
      return;
    }

    try {
      await onSubmit({
        ...form,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
      });

      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save engineer.');
    }
  };

  return (
    <div
      className="engineer-form-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="engineer-form-modal-title"
    >
      <form className="engineer-form-modal__card" onSubmit={handleSubmit}>
        <header className="engineer-form-modal__header">
          <div>
            <p className="engineer-form-modal__eyebrow">Engineer</p>

            <h2 id="engineer-form-modal-title" className="engineer-form-modal__title">
              Add engineer
            </h2>

            <p className="engineer-form-modal__description">
              Create a new engineer for maintenance assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="engineer-form-modal__close-button"
            disabled={loading}
            aria-label="Close modal"
          >
            ×
          </button>
        </header>

        <div className="engineer-form-modal__body">
          {error ? <div className="engineer-form-modal__alert">{error}</div> : null}

          <div className="engineer-form-modal__grid">
            <label className="engineer-form-modal__field">
              <span className="engineer-form-modal__label">Full name</span>

              <input
                className="engineer-form-modal__input"
                type="text"
                value={form.fullName}
                onChange={(event) => handleChange('fullName', event.target.value)}
                placeholder="John Smith"
                disabled={loading}
              />
            </label>

            <label className="engineer-form-modal__field">
              <span className="engineer-form-modal__label">Email</span>

              <input
                className="engineer-form-modal__input"
                type="email"
                value={form.email}
                onChange={(event) => handleChange('email', event.target.value)}
                placeholder="john.smith@company.com"
                disabled={loading}
              />
            </label>

            <label className="engineer-form-modal__field engineer-form-modal__field--wide">
              <span className="engineer-form-modal__label">Max tasks per day</span>

              <input
                className="engineer-form-modal__input"
                type="number"
                min={1}
                value={form.maxTasksPerDay}
                onChange={(event) =>
                  handleChange('maxTasksPerDay', Number(event.target.value))
                }
                disabled={loading}
              />
            </label>
          </div>

          <label className="engineer-form-modal__toggle-row">
            <div>
              <span className="engineer-form-modal__toggle-title">Active</span>
              <small className="engineer-form-modal__toggle-description">
                Inactive engineers cannot receive new tasks.
              </small>
            </div>

            <span className="engineer-form-modal__switch">
              <input
                className="engineer-form-modal__switch-input"
                type="checkbox"
                checked={form.active}
                onChange={(event) => handleChange('active', event.target.checked)}
                disabled={loading}
              />

              <span className="engineer-form-modal__switch-track">
                <span className="engineer-form-modal__switch-thumb" />
              </span>
            </span>
          </label>
        </div>

        <footer className="engineer-form-modal__actions">
          <button
            type="button"
            onClick={handleClose}
            className="engineer-form-modal__button engineer-form-modal__button--secondary"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="engineer-form-modal__button engineer-form-modal__button--primary"
          >
            {loading ? <span className="engineer-form-modal__spinner" /> : null}
            {loading ? 'Saving...' : 'Save engineer'}
          </button>
        </footer>
      </form>
    </div>
  );
}