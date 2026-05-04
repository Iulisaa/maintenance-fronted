import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { getEquipmentHistoryForTask } from '../../api/taskApi';
import type {
  CompleteTasksRequest,
  EquipmentInspectionHistoryItem,
  InspectionResult,
  InspectionTask,
} from '../../types/task';
import './CompleteTaskModal.css';

interface CompleteTasksModalProps {
  open: boolean;
  tasks: InspectionTask[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: CompleteTasksRequest) => Promise<void>;
}

type CompleteTasksFormItemState = {
  taskId: string;
  result: InspectionResult;
  observations: string;
};

type CompleteTasksFormState = {
  items: CompleteTasksFormItemState[];
  performedAt: string;
  reportTemplateCode: string;
};

const resultOptions: Array<{
  value: InspectionResult;
  label: string;
  description: string;
}> = [
  {
    value: 'PASSED',
    label: 'Passed',
    description: 'Equipment passed the inspection.',
  },
  {
    value: 'FAILED',
    label: 'Failed',
    description: 'Equipment failed the inspection and needs corrective action.',
  },
  {
    value: 'FOLLOW_UP',
    label: 'Follow-up',
    description: 'Additional work or another inspection is required.',
  },
];

export default function CompleteTasksModal({
  open,
  tasks,
  loading,
  onClose,
  onSubmit,
}: CompleteTasksModalProps) {
  const [form, setForm] = useState<CompleteTasksFormState>({
    items: [],
    performedAt: '',
    reportTemplateCode: 'DEFAULT',
  });

  const [error, setError] = useState('');

  const [historyByTaskId, setHistoryByTaskId] = useState<
    Record<string, EquipmentInspectionHistoryItem[]>
  >({});

  const [historyLoadingByTaskId, setHistoryLoadingByTaskId] = useState<
    Record<string, boolean>
  >({});

  const [historyErrorByTaskId, setHistoryErrorByTaskId] = useState<
    Record<string, string>
  >({});

  const completableTasks = useMemo(
    () => tasks.filter(canCompleteTask),
    [tasks],
  );

  const isMultiple = completableTasks.length > 1;

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      items: completableTasks.map((task) => ({
        taskId: task.id,
        result: 'PASSED',
        observations: '',
      })),
      performedAt: toLocalDateTimeInputValue(new Date()),
      reportTemplateCode: 'DEFAULT',
    });

    setError('');
  }, [open, completableTasks]);

  useEffect(() => {
    if (!open || completableTasks.length === 0) {
      setHistoryByTaskId({});
      setHistoryLoadingByTaskId({});
      setHistoryErrorByTaskId({});
      return;
    }

    let cancelled = false;

    async function loadHistory() {
      setHistoryByTaskId({});
      setHistoryErrorByTaskId({});

      const loadingState = completableTasks.reduce<Record<string, boolean>>(
        (acc, task) => {
          acc[task.id] = true;
          return acc;
        },
        {},
      );

      setHistoryLoadingByTaskId(loadingState);

      await Promise.all(
        completableTasks.map(async (task) => {
          try {
            const history = await getEquipmentHistoryForTask(task.id);

            if (cancelled) {
              return;
            }

            setHistoryByTaskId((current) => ({
              ...current,
              [task.id]: history,
            }));
          } catch {
            if (cancelled) {
              return;
            }

            setHistoryErrorByTaskId((current) => ({
              ...current,
              [task.id]: 'Could not load previous inspections.',
            }));
          } finally {
            if (cancelled) {
              return;
            }

            setHistoryLoadingByTaskId((current) => ({
              ...current,
              [task.id]: false,
            }));
          }
        }),
      );
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [open, completableTasks]);

  if (!open || completableTasks.length === 0) {
    return null;
  }

  const handleClose = () => {
    if (loading) {
      return;
    }

    onClose();
  };

  const updateItem = (
    taskId: string,
    patch: Partial<Omit<CompleteTasksFormItemState, 'taskId'>>,
  ) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.taskId === taskId ? { ...item, ...patch } : item,
      ),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const reportTemplateCode = form.reportTemplateCode.trim();

    if (!reportTemplateCode) {
      setError('Report template code is required.');
      return;
    }

    const missingEngineerTask = completableTasks.find(
      (task) => !task.assignedEngineer?.id,
    );

    if (missingEngineerTask) {
      setError(
        `Task for ${missingEngineerTask.equipment.name} has no assigned engineer.`,
      );
      return;
    }

    const invalidItem = form.items.find((item) => !item.observations.trim());

    if (invalidItem) {
      const invalidTask = completableTasks.find(
        (task) => task.id === invalidItem.taskId,
      );

      setError(
        `Inspection observations are required for ${
          invalidTask?.equipment.name ?? 'one selected task'
        }.`,
      );

      return;
    }

    const payload: CompleteTasksRequest = {
      performedAt: form.performedAt
        ? new Date(form.performedAt).toISOString()
        : null,
      reportTemplateCode,
      items: form.items.map((item) => ({
        taskId: item.taskId,
        result: item.result,
        observations: item.observations.trim(),
      })),
    };

    try {
      await onSubmit(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Failed to complete inspection task.',
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
      <button
        type="button"
        className="complete-task-modal__backdrop"
        onClick={handleClose}
        disabled={loading}
        aria-label="Close modal"
      />

      <form className="complete-task-modal__card" onSubmit={handleSubmit}>
        <header className="complete-task-modal__header">
          <div className="complete-task-modal__header-glow" />

          <div className="complete-task-modal__icon" aria-hidden="true">
            ✓
          </div>

          <div className="complete-task-modal__heading">
            <p className="complete-task-modal__eyebrow">
              {isMultiple ? 'Batch completion' : 'Inspection completion'}
            </p>

            <h2
              id="complete-task-modal-title"
              className="complete-task-modal__title"
            >
              {isMultiple
                ? `${completableTasks.length} inspections ready to close`
                : 'Close inspection task'}
            </h2>

            <p className="complete-task-modal__subtitle">
              {isMultiple
                ? 'Review each equipment result and add observations before generating the inspection records.'
                : 'Confirm the result, add field observations, and complete this inspection.'}
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

        <div className="complete-task-modal__body">
          <section className="complete-task-modal__top-panel">
            <label className="complete-task-modal__field">
              <span>Performed at</span>

              <input
                className="complete-task-modal__input"
                type="datetime-local"
                value={form.performedAt}
                disabled={loading}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    performedAt: event.target.value,
                  }))
                }
              />

              <small className="complete-task-modal__hint">
                Applied to all selected inspections.
              </small>
            </label>

            <label className="complete-task-modal__field">
              <span>Report template</span>

              <input
                className="complete-task-modal__input"
                value={form.reportTemplateCode}
                disabled={loading}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    reportTemplateCode: event.target.value,
                  }))
                }
                placeholder="DEFAULT"
              />
            </label>
          </section>

          {error && <div className="complete-task-modal__error">{error}</div>}

          <section className="complete-task-modal__tasks-list">
            {completableTasks.map((task, index) => {
              const item = form.items.find(
                (formItem) => formItem.taskId === task.id,
              );

              if (!item) {
                return null;
              }

              return (
                <article
                  key={task.id}
                  className="complete-task-modal__task-block"
                >
                  <div className="complete-task-modal__task-top">
                    <div className="complete-task-modal__task-index">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <div className="complete-task-modal__task-title-group">
                      <span>Equipment</span>
                      <h3>{task.equipment.name}</h3>
                    </div>

                    <div className="complete-task-modal__task-badges">
                      <span>{task.equipment.code || 'No code'}</span>
                      <span>{formatDate(task.plannedDate)}</span>
                    </div>
                  </div>

                  <div className="complete-task-modal__task-meta">
                    <div>
                      <span>Engineer</span>
                      <strong>{task.assignedEngineer?.fullName || '-'}</strong>
                    </div>

                    <div>
                      <span>Source</span>
                      <strong>{task.source}</strong>
                    </div>

                    <div>
                      <span>Occurrence</span>
                      <strong>{task.occurrenceNumber ?? '-'}</strong>
                    </div>
                  </div>

                  <EquipmentHistoryPanel
                    history={historyByTaskId[task.id] ?? []}
                    loading={historyLoadingByTaskId[task.id] ?? false}
                    error={historyErrorByTaskId[task.id]}
                  />

                  <section className="complete-task-modal__section">
                    <div className="complete-task-modal__section-header">
                      <h4>Inspection result</h4>
                      <p>Select the final outcome for this equipment.</p>
                    </div>

                    <div className="complete-task-modal__result-grid">
                      {resultOptions.map((option) => (
                        <label
                          key={option.value}
                          className={
                            item.result === option.value
                              ? 'complete-task-modal__result-option complete-task-modal__result-option--selected'
                              : 'complete-task-modal__result-option'
                          }
                        >
                          <input
                            type="radio"
                            name={`result-${task.id}`}
                            value={option.value}
                            checked={item.result === option.value}
                            disabled={loading}
                            onChange={() =>
                              updateItem(task.id, {
                                result: option.value,
                              })
                            }
                          />

                          <span
                            className={`complete-task-modal__result-dot complete-task-modal__result-dot--${option.value
                              .toLowerCase()
                              .replace('_', '-')}`}
                          />

                          <span className="complete-task-modal__result-copy">
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
                        <h4>Observations</h4>
                        <p>Add relevant field notes for this equipment.</p>
                      </div>

                      <span className="complete-task-modal__counter">
                        {item.observations.length}/5000
                      </span>
                    </div>

                    <textarea
                      className="complete-task-modal__textarea"
                      value={item.observations}
                      disabled={loading}
                      maxLength={5000}
                      onChange={(event) =>
                        updateItem(task.id, {
                          observations: event.target.value,
                        })
                      }
                      placeholder="Example: Checked operating condition, verified safety parameters, no visible issues found."
                    />
                  </section>
                </article>
              );
            })}
          </section>
        </div>

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
            {loading && <span className="complete-task-modal__spinner" />}
            {loading
              ? 'Saving…'
              : isMultiple
                ? `Complete ${completableTasks.length} inspections`
                : 'Complete inspection'}
          </button>
        </footer>
      </form>
    </div>
  );
}

interface EquipmentHistoryPanelProps {
  history: EquipmentInspectionHistoryItem[];
  loading: boolean;
  error?: string;
}

function EquipmentHistoryPanel({
  history,
  loading,
  error,
}: EquipmentHistoryPanelProps) {
  const visibleHistory = history.slice(0, 3);

  return (
    <section className="complete-task-modal__history">
      <div className="complete-task-modal__history-header">
        <div>
          <h4>Previous inspections</h4>
          <p>Recent observations recorded for this equipment.</p>
        </div>

        {!loading && !error && (
          <span className="complete-task-modal__history-count">
            {history.length}
          </span>
        )}
      </div>

      {loading && (
        <div className="complete-task-modal__history-state">
          Loading previous inspections...
        </div>
      )}

      {!loading && error && (
        <div className="complete-task-modal__history-state complete-task-modal__history-state--error">
          {error}
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="complete-task-modal__history-empty">
          No previous inspections found for this equipment.
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="complete-task-modal__history-list">
          {visibleHistory.map((item, index) => (
            <article
              key={`${item.performedAt ?? 'unknown'}-${index}`}
              className="complete-task-modal__history-item"
            >
              <div className="complete-task-modal__history-item-top">
                <div>
                  <strong>{formatHistoryDate(item.performedAt)}</strong>

                  {item.engineerName && <span>By {item.engineerName}</span>}
                </div>

                {item.result && (
                  <span
                    className={`complete-task-modal__history-result complete-task-modal__history-result--${item.result
                      .toLowerCase()
                      .replace('_', '-')}`}
                  >
                    {formatResultLabel(item.result)}
                  </span>
                )}
              </div>

              <p className="complete-task-modal__history-observation">
                {item.observations?.trim() || 'No observations recorded.'}
              </p>

              {(item.reportNumber || item.fileName) && (
                <div className="complete-task-modal__history-report">
                  {item.reportNumber && <span>Report {item.reportNumber}</span>}
                  {item.fileName && <span>{item.fileName}</span>}
                </div>
              )}
            </article>
          ))}

          {history.length > visibleHistory.length && (
            <div className="complete-task-modal__history-more">
              +{history.length - visibleHistory.length} older inspection
              {history.length - visibleHistory.length === 1 ? '' : 's'}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatHistoryDate(value: string | null): string {
  if (!value) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatResultLabel(value: InspectionResult): string {
  return value
    .toLowerCase()
    .replace('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function toLocalDateTimeInputValue(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  const hours = `${value.getHours()}`.padStart(2, '0');
  const minutes = `${value.getMinutes()}`.padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function canCompleteTask(task: InspectionTask): boolean {
  return task.status === 'PLANNED' || task.status === 'ASSIGNED';
}