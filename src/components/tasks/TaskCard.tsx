import type { MaintenanceTask } from '../../types/task';
import './TaskCard.css';

interface TaskCardProps {
  task: MaintenanceTask;
  onOpen: (task: MaintenanceTask) => void;
}

export default function TaskCard({ task, onOpen }: TaskCardProps) {
  return (
    <article className="task-card">
      <div className="task-card__header">
        <div className="task-card__identity">
         

          <div className="task-card__main">
            <p className="task-card__eyebrow">Pending report</p>

            <h3 className="task-card__title">{task.equipmentName}</h3>

            <p className="task-card__muted-text">Scheduled: {task.scheduledDate}</p>
          </div>
        </div>

        <span className="task-card__status task-card__status--warning">
          {task.status}
        </span>
      </div>

      <div className="task-card__footer">
        <div>
          <p className="task-card__muted-label">Engineer</p>
          <p className="task-card__engineer-name">{task.engineerName}</p>
        </div>

        <button type="button" className="task-card__button" onClick={() => onOpen(task)}>
          Complete report
        </button>
      </div>
    </article>
  );
}