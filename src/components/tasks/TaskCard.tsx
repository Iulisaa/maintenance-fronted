import type { InspectionTask } from '../../types/task';
import './TaskCard.css';

interface TaskCardProps {
  task: InspectionTask;
  onComplete: (tasks: InspectionTask[]) => void;
}

function canCompleteTask(task: InspectionTask): boolean {
  return task.status === 'PLANNED' || task.status === 'ASSIGNED';
}

export default function TaskCard({ task, onComplete }: TaskCardProps) {
    console.log('TASK CARD DATA:', task);
  console.log('inspectionReportId:', task.inspectionReportId);
  const canComplete = canCompleteTask(task);
  const hasEngineer = Boolean(task.assignedEngineer?.id);
  const canDownloadPdf = task.status === 'COMPLETED' && Boolean(task.inspectionReportId);
  const equipmentName = task.equipment.name;
  const engineerName = task.assignedEngineer?.fullName ?? 'Unassigned';
  const equipmentCode = task.equipment.code;

  return (
    <article className="task-card">
      <div className="task-card__glow" />

      <header className="task-card__header">
        <div className="task-card__identity">
          <span className="task-card__eyebrow">
            {canComplete ? 'Inspection task' : 'Inspection record'}
          </span>

          <h3 className="task-card__title">{equipmentName}</h3>

          <div className="task-card__chips">
            <span className="task-card__chip">
              <span className="task-card__chip-dot" />
              {formatDate(task.plannedDate)}
            </span>

            <span className="task-card__chip">
              Code: {equipmentCode}
            </span>
          </div>
        </div>

        <span
          className={[
            'task-card__status',
            getStatusClass(task.status),
          ].join(' ')}
        >
          {formatStatus(task.status)}
        </span>
      </header>

      <dl className="task-card__details">
        <div className="task-card__detail">
          <dt>Engineer</dt>
          <dd>{engineerName}</dd>
        </div>

        <div className="task-card__detail">
          <dt>Source</dt>
          <dd>{formatSource(task.source)}</dd>
        </div>

        <div className="task-card__detail">
          <dt>Occurrence</dt>
          <dd>{task.occurrenceNumber ?? '-'}</dd>
        </div>

        {task.completedAt && (
  <div className="task-card__detail task-card__detail--wide task-card__completed-detail">
    <div>
      <dt>Completed</dt>
      <dd>{formatDateTime(task.completedAt)}</dd>
    </div>

    {canDownloadPdf && (
      <button
        type="button"
        className="task-card__pdf-button"
        onClick={() => downloadInspectionReportPdf(task.inspectionReportId!)}
      >
        Proces verbal
      </button>
    )}
  </div>
)}
      </dl>

      <footer className="task-card__footer">
        <button
          type="button"
          className="task-card__button"
          onClick={() => onComplete([task])}
          disabled={!canComplete || !hasEngineer}
        >
          {canComplete ? 'Complete inspection' : 'Completed'}
        </button>
      </footer>
    </article>
  );
}

function getStatusClass(status: InspectionTask['status']): string {
  switch (status) {
    case 'PLANNED':
      return 'task-card__status--planned';
    case 'ASSIGNED':
      return 'task-card__status--assigned';
    case 'COMPLETED':
      return 'task-card__status--completed';
    case 'CANCELLED':
      return 'task-card__status--cancelled';
    case 'SKIPPED':
      return 'task-card__status--skipped';
    default:
      return 'task-card__status--neutral';
  }
}

function formatStatus(status: InspectionTask['status']): string {
  switch (status) {
    case 'PLANNED':
      return 'Planned';
    case 'ASSIGNED':
      return 'Assigned';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'SKIPPED':
      return 'Skipped';
    default:
      return status;
  }
}

function formatSource(source: InspectionTask['source']): string {
  switch (source) {
    case 'GENERATED':
      return 'Generated';
    case 'MANUAL':
      return 'Manual';
    default:
      return source;
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export async function downloadInspectionReportPdf(reportId: string): Promise<void> {
  const response = await fetch(`/api/inspection-reports/${reportId}/pdf`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to download inspection report PDF');
  }

  const contentDisposition = response.headers.get('content-disposition');

  let fileName = `inspection-report-${reportId}.pdf`;

  const fileNameMatch = contentDisposition?.match(/filename="([^"]+)"/);
  if (fileNameMatch?.[1]) {
    fileName = fileNameMatch[1];
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
}