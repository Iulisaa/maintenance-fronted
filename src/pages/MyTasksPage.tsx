import { useEffect, useMemo, useState } from 'react';
import { getEngineers } from '../api/engineerApi';
import { generateTaskReportPdf, getPendingTasksForEngineer } from '../api/taskApi';
import CompleteTaskModal from '../components/tasks/CompleteTaskModal';
import TaskCard from '../components/tasks/TaskCard';
import type { Engineer } from '../types/engineers';
import type { CompleteTaskRequest, MaintenanceTask } from '../types/task';
import './MyTasksPage.css';

function todayAsIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function MyTasksPage() {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [selectedEngineerId, setSelectedEngineerId] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayAsIso());
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loadingEngineers, setLoadingEngineers] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTask, setActiveTask] = useState<MaintenanceTask | null>(null);

  const loading = loadingEngineers || loadingTasks;

  useEffect(() => {
    const loadEngineers = async () => {
      setLoadingEngineers(true);
      setError('');

      try {
        const engineerResponse = await getEngineers();
        const engineerList = Array.isArray(engineerResponse) ? engineerResponse : [];
        const activeEngineers = engineerList.filter((engineer) => engineer.active);

        setEngineers(activeEngineers);

        if (activeEngineers.length > 0) {
          setSelectedEngineerId((current) => current || activeEngineers[0].id);
        } else {
          setSelectedEngineerId('');
          setTasks([]);
        }
      } catch (engineersError) {
        setError(
          engineersError instanceof Error
            ? engineersError.message
            : 'Failed to load engineers.',
        );
        setEngineers([]);
        setSelectedEngineerId('');
        setTasks([]);
      } finally {
        setLoadingEngineers(false);
      }
    };

    void loadEngineers();
  }, []);

  useEffect(() => {
    if (!selectedEngineerId) {
      return;
    }

    const loadTasks = async () => {
      setLoadingTasks(true);
      setError('');

      try {
        const pendingTasks = await getPendingTasksForEngineer(selectedEngineerId, selectedDate);
        setTasks(Array.isArray(pendingTasks) ? pendingTasks : []);
      } catch (tasksError) {
        setError(tasksError instanceof Error ? tasksError.message : 'Failed to load tasks.');
        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };

    void loadTasks();
  }, [selectedEngineerId, selectedDate]);

  const selectedEngineer = useMemo(
    () => engineers.find((engineer) => engineer.id === selectedEngineerId),
    [engineers, selectedEngineerId],
  );

  const handleSubmitReport = async (taskId: string, payload: CompleteTaskRequest) => {
    try {
      setSubmitting(true);
      setError('');

      await generateTaskReportPdf(taskId, payload);

      setActiveTask(null);

      if (selectedEngineerId) {
        const plannedTasks = await getPendingTasksForEngineer(selectedEngineerId, selectedDate);
        setTasks(Array.isArray(plannedTasks) ? plannedTasks : []);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Failed to generate report PDF.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="my-tasks-page">
      <div className="my-tasks-page__hero">
        <div className="my-tasks-page__hero-main">
          <div>
            <p className="my-tasks-page__eyebrow">Field execution</p>

            <h2 className="my-tasks-page__title">My Tasks</h2>

            <p className="my-tasks-page__description">
              Review pending maintenance checks and complete field reports directly in the app.
            </p>
          </div>
        </div>

        <div className="my-tasks-page__stats">
          <div className="my-tasks-page__stat-card">
            <span className="my-tasks-page__stat-label">Pending</span>
            <strong className="my-tasks-page__stat-value">{tasks.length}</strong>
          </div>

          <div className="my-tasks-page__stat-card">
            <span className="my-tasks-page__stat-label">Engineer</span>
            <strong className="my-tasks-page__stat-value my-tasks-page__stat-value--text">
              {selectedEngineer?.fullName || '-'}
            </strong>
          </div>

          <div className="my-tasks-page__stat-card">
            <span className="my-tasks-page__stat-label">Date</span>
            <strong className="my-tasks-page__stat-value my-tasks-page__stat-value--text">
              {selectedDate}
            </strong>
          </div>
        </div>
      </div>

      <section className="my-tasks-page__toolbar">
        <label className="my-tasks-page__control my-tasks-page__control--engineer">
          <span className="my-tasks-page__control-icon">👷</span>

          <select
            className="my-tasks-page__select"
            value={selectedEngineerId}
            onChange={(event) => setSelectedEngineerId(event.target.value)}
            disabled={loadingEngineers || engineers.length === 0}
            aria-label="Engineer"
          >
            {engineers.length === 0 ? (
              <option value="">No active engineers</option>
            ) : (
              engineers.map((engineer) => (
                <option key={engineer.id} value={engineer.id}>
                  {engineer.fullName}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="my-tasks-page__control my-tasks-page__control--date">
          <span className="my-tasks-page__control-icon">📅</span>

          <input
            className="my-tasks-page__input"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            aria-label="Date"
          />
        </label>
      </section>

      {error ? <div className="my-tasks-page__alert">{error}</div> : null}

      {loading ? (
        <section className="my-tasks-page__state-card">
          <div className="my-tasks-page__state-icon">⋯</div>
          <h3>Loading tasks...</h3>
          <p>Please wait while assigned work is being retrieved.</p>
        </section>
      ) : tasks.length === 0 ? (
        <section className="my-tasks-page__state-card">
          <div className="my-tasks-page__state-icon">✓</div>
          <h3>No pending tasks</h3>
          <p>There are no incomplete maintenance reports for the selected engineer and date.</p>
        </section>
      ) : (
        <section className="my-tasks-page__grid">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={setActiveTask} />
          ))}
        </section>
      )}

      <CompleteTaskModal
        open={Boolean(activeTask)}
        task={activeTask}
        loading={submitting}
        onClose={() => setActiveTask(null)}
        onSubmit={handleSubmitReport}
      />
    </section>
  );
}