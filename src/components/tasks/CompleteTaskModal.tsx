import { type FormEvent, useEffect, useState } from 'react';
import type { CompleteTaskRequest, MaintenanceResult, MaintenanceTask } from '../../types/task';
import './CompleteTaskModal.css';

interface CompleteTaskModalProps {
  open: boolean;
  task: MaintenanceTask | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (taskId: string, payload: CompleteTaskRequest) => Promise<void>;
}

const initialForm: CompleteTaskRequest = {
  observations: '',
  result: 'PASSED',
  performedAt: null,
};

const resultOptions: Array<{
  value: MaintenanceResult;
  label: string;
  description: string;
}> = [
  {
    value: 'PASSED',
    label: 'Passed',
    description: 'Equipment passed the maintenance check.',
  },
  {
    value: 'FAILED',
    label: 'Failed',
    description: 'Issue found and equipment did not pass.',
  },
  {
    value: 'REQUIRES_FOLLOW_UP',
    label: 'Follow-up',
    description: 'Additional work or inspection is required.',
  },
];

export default function CompleteTaskModal({
  open,
  task,
  loading,
  onClose,
  onSubmit,
}: CompleteTaskModalProps) {
  const [form, setForm] = useState<CompleteTaskRequest>(initialForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setError('');
    }
  }, [open, task?.id]);

  if (!open || !task) {
    return null;
  }

  const handleClose = () => {
    if (loading) {
      return;
    }

    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const observations = form.observations.trim();

    if (!observations) {
      setError('Observations are required.');
      return;
    }

    try {
      await onSubmit(task.id, {
        observations,
        result: form.result,
        performedAt: new Date().toISOString(),
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Failed to complete maintenance task.',
      );
    }
  };

  return (
    <div
      className="complete-task-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="complete-task-modal-title"
    >
      <form className="complete-task-modal__card" onSubmit={handleSubmit}>
        <header className="complete-task-modal__header">
          <div className="complete-task-modal__icon" aria-hidden="true">
            ✓
          </div>

          <div className="complete-task-modal__heading">
            <p className="complete-task-modal__eyebrow">Complete task</p>

            <h2 id="complete-task-modal-title" className="complete-task-modal__title">
              Maintenance result
            </h2>

            <p className="complete-task-modal__subtitle">
              Submit the final result and field observations.
            </p>
          </div>

          <button
            type="button"
            className="complete-task-modal__close-button"
            onClick={handleClose}
            disabled={loading}
            aria-label="Close modal"
          >
            ×
          </button>
        </header>

        <section className="complete-task-modal__task-summary">
          <div>
            <span className="complete-task-modal__summary-label">Equipment</span>
            <strong>{task.equipmentName}</strong>
          </div>

          <div>
            <span className="complete-task-modal__summary-label">Engineer</span>
            <strong>{task.engineerName}</strong>
          </div>

          <div>
            <span className="complete-task-modal__summary-label">Scheduled</span>
            <strong>{task.scheduledDate}</strong>
          </div>
        </section>

        {error ? <div className="complete-task-modal__error">{error}</div> : null}

        <section className="complete-task-modal__section">
          <div className="complete-task-modal__section-header">
            <h3>Result</h3>
            <p>Select the final maintenance outcome.</p>
          </div>

          <div className="complete-task-modal__result-grid">
            {resultOptions.map((option) => (
              <label
                key={option.value}
                className={
                  form.result === option.value
                    ? 'complete-task-modal__result-option complete-task-modal__result-option--selected'
                    : 'complete-task-modal__result-option'
                }
              >
                <input
                  type="radio"
                  name="result"
                  value={option.value}
                  checked={form.result === option.value}
                  disabled={loading}
                  onChange={() =>
                    setForm((current) => ({
                      ...current,
                      result: option.value,
                    }))
                  }
                />

                <span className={`complete-task-modal__result-dot complete-task-modal__result-dot--${option.value.toLowerCase()}`} />

                <span>
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="complete-task-modal__section">
          <div className="complete-task-modal__label-row">
            <div className="complete-task-modal__section-header">
              <h3>Observations</h3>
              <p>Add the relevant field notes for this maintenance task.</p>
            </div>

            <span className="complete-task-modal__counter">
              {form.observations.length}/5000
            </span>
          </div>

          <textarea
            className="complete-task-modal__textarea"
            value={form.observations}
            disabled={loading}
            maxLength={5000}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                observations: event.target.value,
              }))
            }
            placeholder="Example: Checked operating condition, cleaned filters, verified safety parameters, no visible issues found."
          />
        </section>

        <footer className="complete-task-modal__footer">
          <button
            type="button"
            className="complete-task-modal__button complete-task-modal__button--secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="complete-task-modal__button complete-task-modal__button--primary"
            disabled={loading}
          >
            {loading ? <span className="complete-task-modal__spinner" /> : null}
            {loading ? 'Saving…' : 'Complete task'}
          </button>
        </footer>
      </form>
    </div>
  );
}