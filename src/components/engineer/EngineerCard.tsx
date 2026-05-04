import type { Engineer } from '../../types/engineers';
import './EngineerCard.css';

type Props = {
  engineer: Engineer;
  onEdit?: (engineer: Engineer) => void;
  onDelete?: (engineer: Engineer) => void;
};

export default function EngineerCard({ engineer, onEdit, onDelete }: Props) {
  return (
    <article className="engineer-card">
      <div className="engineer-card__top">
        
        <span
          className={
            engineer.active
              ? 'engineer-card__status engineer-card__status--active'
              : 'engineer-card__status engineer-card__status--inactive'
          }
        >
          {engineer.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="engineer-card__body">
      

        <h3 className="engineer-card__title">{engineer.name}</h3>

        <a className="engineer-card__email" href={`mailto:${engineer.email}`}>
          {engineer.email}
        </a>
      </div>

      <dl className="engineer-card__meta">
        <div className="engineer-card__meta-item">
          <dt>Status</dt>
          <dd>{engineer.active ? 'Available for tasks' : 'Not available'}</dd>
        </div>

        {engineer.createdAt && (
          <div className="engineer-card__meta-item">
            <dt>Created</dt>
            <dd>{formatDate(engineer.createdAt)}</dd>
          </div>
        )}
      </dl>

      {(onEdit || onDelete) && (
        <div className="engineer-card__actions">
          {onEdit && (
            <button
              type="button"
              className="engineer-card__button engineer-card__button--secondary"
              onClick={() => onEdit(engineer)}
            >
              Edit
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              className="engineer-card__button engineer-card__button--danger"
              onClick={() => onDelete(engineer)}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  );
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}