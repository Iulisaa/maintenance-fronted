import { type FormEvent, useEffect, useState } from 'react';
import type { CreateEngineerRequest } from '../../types/engineers';
import './EngineerFormModal.css';

type Props = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateEngineerRequest) => Promise<void>;
};

type EngineerFormState = {
  name: string;
  email: string;
  maxTasksPerDay: number;
};

const initialForm: EngineerFormState = {
  name: '',
  email: '',
  maxTasksPerDay: 5,

};

export default function EngineerFormModal({
  open,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<EngineerFormState>(initialForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setError('');
    }
  }, [open]);

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

  const handleChange = (field: keyof EngineerFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) {
      setError('Name is required.');
      return false;
    }

    if (!email) {
      setError('Email is required.');
      return false;
    }

    return true;
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
  email: form.email.trim(),
  maxTasksPerDay: form.maxTasksPerDay,
});
if (form.maxTasksPerDay <= 0) {
  setError('Max tasks per day must be greater than 0.');
  return;
}
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
      <button
        type="button"
        className="engineer-form-modal__backdrop"
        onClick={handleClose}
        disabled={loading}
        aria-label="Close modal"
      />

      <form className="engineer-form-modal__card" onSubmit={handleSubmit}>
        <header className="engineer-form-modal__header">
          <div>
            <p className="engineer-form-modal__eyebrow">Engineer</p>

            <h2 id="engineer-form-modal-title" className="engineer-form-modal__title">
              Add engineer
            </h2>

            <p className="engineer-form-modal__description">
              Create a new engineer who can be assigned inspection tasks.
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
          {error && (
            <div className="engineer-form-modal__alert">
              {error}
            </div>
          )}

          <div className="engineer-form-modal__grid">
            <label className="engineer-form-modal__field">
              <span className="engineer-form-modal__label">Name</span>

              <input
                className="engineer-form-modal__input"
                type="text"
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                placeholder="John Smith"
                disabled={loading}
                autoFocus
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
            <dl className="engineer-card__meta">
  <div className="engineer-card__meta-item">
    <dt>Max tasks / day</dt>
    <dd>{form.maxTasksPerDay}</dd>
  </div>

</dl>
          </div>
          
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
            {loading && <span className="engineer-form-modal__spinner" />}
            {loading ? 'Saving...' : 'Save engineer'}
          </button>
        </footer>
      </form>
    </div>
  );
}