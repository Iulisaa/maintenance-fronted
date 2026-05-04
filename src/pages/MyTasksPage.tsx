import { useCallback, useEffect, useMemo, useState } from 'react';
import { getEngineers } from '../api/engineerApi';
import { completeTasks, getTasksForEngineer } from '../api/taskApi';
import CompleteTasksModal from '../components/tasks/CompleteTaskModal';
import TaskCard from '../components/tasks/TaskCard';
import type { Engineer } from '../types/engineers';
import type {
  CompleteTasksRequest,
  InspectionTask,
  TaskFilter,
} from '../types/task';
import './MyTasksPage.css';

const today = new Date();

const defaultSelectedDate = toDateInputValue(today);
const defaultSelectedMonth = toMonthInputValue(today);

export default function MyTasksPage() {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [selectedEngineerId, setSelectedEngineerId] = useState('');

  const [tasks, setTasks] = useState<InspectionTask[]>([]);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('PLANNED');



const [selectedDate, setSelectedDate] = useState(defaultSelectedDate);
const [selectedMonth, setSelectedMonth] = useState(defaultSelectedMonth);

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [tasksToComplete, setTasksToComplete] = useState<InspectionTask[]>([]);

  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);

  const [loadingEngineers, setLoadingEngineers] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState('');

  const completableTasks = useMemo(
    () => tasks.filter(canCompleteTask),
    [tasks],
  );
const dateRange = useMemo(
  () => getDateRangeForFilter(taskFilter, selectedDate, selectedMonth),
  [taskFilter, selectedDate, selectedMonth],
);
  const selectedTasks = useMemo(
    () => completableTasks.filter((task) => selectedTaskIds.includes(task.id)),
    [completableTasks, selectedTaskIds],
  );

  const selectedEngineer = useMemo(
    () => engineers.find((engineer) => engineer.id === selectedEngineerId),
    [engineers, selectedEngineerId],
  );

  const allVisibleCompletableTasksSelected =
    completableTasks.length > 0 &&
    selectedTaskIds.length === completableTasks.length;

const handleTaskFilterChange = (nextFilter: TaskFilter) => {
  setTaskFilter(nextFilter);
  setSelectedTaskIds([]);

  if (nextFilter === 'PLANNED') {
    setSelectedDate(toDateInputValue(new Date()));
    return;
  }

  setSelectedMonth(toMonthInputValue(new Date()));
};

  const loadEngineers = useCallback(async () => {
    setLoadingEngineers(true);
    setError('');

    try {
      const engineersResponse = await getEngineers();

      setEngineers(engineersResponse);

      if (!selectedEngineerId && engineersResponse.length > 0) {
        setSelectedEngineerId(engineersResponse[0].id);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load engineers.',
      );
    } finally {
      setLoadingEngineers(false);
    }
  }, [selectedEngineerId]);

  const loadTasks = useCallback(async () => {
    if (!selectedEngineerId) {
      setTasks([]);
      return;
    }

    setLoadingTasks(true);
    setError('');

    try {
    const tasksResponse = await getTasksForEngineer(
  selectedEngineerId,
  dateRange.startDate,
  dateRange.endDate,
  taskFilter,
);

      setTasks(tasksResponse);
      setSelectedTaskIds([]);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load inspection tasks.',
      );
    } finally {
      setLoadingTasks(false);
    }
}, [selectedEngineerId, dateRange.startDate, dateRange.endDate, taskFilter]);

  useEffect(() => {
    void loadEngineers();
  }, [loadEngineers]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const openCompleteModal = (tasksForModal: InspectionTask[]) => {
    const validTasks = tasksForModal.filter(
      (task) => canCompleteTask(task) && Boolean(task.assignedEngineer?.id),
    );

    if (validTasks.length === 0) {
      setError('Please select at least one planned or assigned task with an assigned engineer.');
      return;
    }

    setTasksToComplete(validTasks);
    setCompleteModalOpen(true);
    setError('');
  };

  const closeCompleteModal = () => {
    if (completeLoading) {
      return;
    }

    setCompleteModalOpen(false);
    setTasksToComplete([]);
  };

  const handleCompleteTasks = async (payload: CompleteTasksRequest) => {
    setCompleteLoading(true);
    setError('');

    try {
      await completeTasks(payload);

      setCompleteModalOpen(false);
      setTasksToComplete([]);
      setSelectedTaskIds([]);

      await loadTasks();
    } catch (completeError) {
      setError(
        completeError instanceof Error
          ? completeError.message
          : 'Failed to complete selected inspection tasks.',
      );

      throw completeError;
    } finally {
      setCompleteLoading(false);
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((current) =>
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId],
    );
  };

  const toggleAllVisibleCompletableTasks = () => {
    if (allVisibleCompletableTasksSelected) {
      setSelectedTaskIds([]);
      return;
    }

    setSelectedTaskIds(completableTasks.map((task) => task.id));
  };

  return (
    <main className="my-tasks-page">
      <section className="my-tasks-page__header">
        <div className="my-tasks-page__header-main">
          <div className="my-tasks-page__heading">
            <p className="my-tasks-page__eyebrow">Maintenance operations</p>

            <h1 className="my-tasks-page__title">Inspection tasks</h1>

            <p className="my-tasks-page__description">
              Review planned inspections, complete one task, or select multiple
              tasks and generate one grouped inspection report.
            </p>
          </div>
        </div>

        <div className="my-tasks-page__stats">
          <div className="my-tasks-page__stat-card">
            <span className="my-tasks-page__stat-label">Engineer</span>
            <span className="my-tasks-page__stat-value my-tasks-page__stat-value--text">
              {selectedEngineer?.name || 'Not selected'}
            </span>
          </div>

          <div className="my-tasks-page__stat-card">
            <span className="my-tasks-page__stat-label">Visible tasks</span>
            <span className="my-tasks-page__stat-value">{tasks.length}</span>
          </div>

          <div className="my-tasks-page__stat-card">
            <span className="my-tasks-page__stat-label">Selectable tasks</span>
            <span className="my-tasks-page__stat-value">{completableTasks.length}</span>
          </div>
        </div>
      </section>

      <section className="my-tasks-page__controls-panel">
        <div className="my-tasks-page__toolbar">
          <label className="my-tasks-page__control my-tasks-page__control--engineer">
            <span className="my-tasks-page__control-label">Engineer</span>

            <select
              className="my-tasks-page__select"
              value={selectedEngineerId}
              disabled={loadingEngineers}
              onChange={(event) => setSelectedEngineerId(event.target.value)}
            >
              {engineers.length === 0 && <option value="">No engineers</option>}

              {engineers.map((engineer) => (
                <option key={engineer.id} value={engineer.id}>
                  {engineer.name}
                </option>
              ))}
            </select>
          </label>

       {taskFilter === 'PLANNED' ? (
  <label className="my-tasks-page__control my-tasks-page__control--date">
    <span className="my-tasks-page__control-label">Inspection date</span>

    <input
      className="my-tasks-page__input"
      type="date"
      value={selectedDate}
      onChange={(event) => {
        setSelectedDate(event.target.value);
        setSelectedTaskIds([]);
      }}
    />
  </label>
) : (
  <div className="my-tasks-page__control my-tasks-page__control--month">
    <span className="my-tasks-page__control-label">Month</span>

    <div className="my-tasks-page__month-switcher">
      <button
        type="button"
        onClick={() => {
          setSelectedMonth((current) => addMonthsToMonthValue(current, -1));
          setSelectedTaskIds([]);
        }}
      >
        Previous
      </button>

      <button
        type="button"
        className="my-tasks-page__month-current"
        onClick={() => {
          setSelectedMonth(toMonthInputValue(new Date()));
          setSelectedTaskIds([]);
        }}
      >
        {formatMonthLabel(selectedMonth)}
      </button>

      <button
        type="button"
        onClick={() => {
          setSelectedMonth((current) => addMonthsToMonthValue(current, 1));
          setSelectedTaskIds([]);
        }}
      >
        Next
      </button>
    </div>
  </div>
)}

        </div>

        <div className="my-tasks-page__filters">
          {(['PLANNED', 'COMPLETED', 'FAILED', 'FOLLOW_UP', 'ALL'] as TaskFilter[]).map(
            (filter) => (
              <button
                key={filter}
                type="button"
                className={taskFilter === filter ? 'active' : ''}
                onClick={() => handleTaskFilterChange(filter)}
              >
                {formatTaskFilter(filter)}
              </button>
            ),
          )}
        </div>

        <div className="my-tasks-page__selection-bar">
          <div>
            <strong>{selectedTasks.length}</strong> selected from{' '}
            <strong>{completableTasks.length}</strong> selectable tasks
          </div>

          <div className="my-tasks-page__selection-actions">
            <button
              type="button"
              className="my-tasks-page__selection-button"
              onClick={toggleAllVisibleCompletableTasks}
              disabled={completableTasks.length === 0}
            >
              {allVisibleCompletableTasksSelected ? 'Clear selection' : 'Select all visible'}
            </button>

            <button
              type="button"
              className="my-tasks-page__selection-button my-tasks-page__selection-button--primary"
              onClick={() => openCompleteModal(selectedTasks)}
              disabled={selectedTasks.length === 0 || completeLoading}
            >
              Complete selected
              {selectedTasks.length > 0 ? ` (${selectedTasks.length})` : ''}
            </button>

            <button
              type="button"
              className="my-tasks-page__selection-button"
              onClick={() => void loadTasks()}
              disabled={loadingTasks || !selectedEngineerId}
            >
              {loadingTasks ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </section>

      {error && <div className="my-tasks-page__alert">{error}</div>}

      {loadingTasks ? (
        <section className="my-tasks-page__state-card">
          <div className="my-tasks-page__state-icon">⌛</div>
          <h3>Loading inspection tasks</h3>
          <p>Please wait while the inspection tasks are loaded.</p>
        </section>
      ) : tasks.length === 0 ? (
        <section className="my-tasks-page__state-card">
          <div className="my-tasks-page__state-icon">✓</div>
          <h3>No inspection tasks found</h3>
          <p>No inspection tasks match the selected engineer, period, or filter.</p>
        </section>
      ) : (
        <section className="my-tasks-page__grid">
          {tasks.map((task) => {
            const canSelect = canCompleteTask(task) && Boolean(task.assignedEngineer?.id);
            const selected = selectedTaskIds.includes(task.id);

            return (
              <div
                key={task.id}
                className={
                  selected
                    ? 'my-tasks-page__task-wrapper my-tasks-page__task-wrapper--selected'
                    : 'my-tasks-page__task-wrapper'
                }
              >
                <label className="my-tasks-page__task-select">
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={!canSelect || completeLoading}
                    onChange={() => toggleTaskSelection(task.id)}
                  />

                  <span>
                    {canSelect ? 'Select for grouped report' : getUnavailableReason(task)}
                  </span>
                </label>

                <TaskCard
                  task={task}
                  onComplete={(tasksForModal) => openCompleteModal(tasksForModal)}
                />
              </div>
            );
          })}
        </section>
      )}

      <CompleteTasksModal
        open={completeModalOpen}
        tasks={tasksToComplete}
        loading={completeLoading}
        onClose={closeCompleteModal}
        onSubmit={handleCompleteTasks}
      />
    </main>
  );
}

function formatTaskFilter(filter: TaskFilter): string {
  switch (filter) {
    case 'PLANNED':
      return 'Planned';
    case 'COMPLETED':
      return 'Completed';
    case 'FAILED':
      return 'Failed';
    case 'FOLLOW_UP':
      return 'Follow-up';
    case 'ALL':
      return 'All';
    default:
      return filter;
  }
}

function canCompleteTask(task: InspectionTask): boolean {
  return task.status === 'PLANNED' || task.status === 'ASSIGNED';
}

function getUnavailableReason(task: InspectionTask): string {
  if (task.status === 'COMPLETED') {
    return 'Already completed';
  }

  if (task.status === 'CANCELLED') {
    return 'Cancelled';
  }

  if (!task.assignedEngineer?.id) {
    return 'No engineer assigned';
  }

  return 'Not selectable';
}

function toDateInputValue(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function toMonthInputValue(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');

  return `${year}-${month}`;
}

function getDateRangeForFilter(
  filter: TaskFilter,
  selectedDate: string,
  selectedMonth: string,
): {
  startDate: string;
  endDate: string;
} {
  if (filter === 'PLANNED') {
    return {
      startDate: selectedDate,
      endDate: selectedDate,
    };
  }

  const [year, month] = selectedMonth.split('-').map(Number);

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return {
    startDate: toDateInputValue(startDate),
    endDate: toDateInputValue(endDate),
  };
}

function addMonthsToMonthValue(value: string, amount: number): string {
  const [year, month] = value.split('-').map(Number);
  const date = new Date(year, month - 1 + amount, 1);

  return toMonthInputValue(date);
}

function formatMonthLabel(value: string): string {
  const [year, month] = value.split('-').map(Number);

  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));
}