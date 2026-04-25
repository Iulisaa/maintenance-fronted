import type { Engineer } from '../../types/engineers';
import './EngineerCard.css';

type Props = {
  engineer: Engineer;
};

export default function EngineerCard({ engineer }: Props) {
  return (
    <article className="engineer-card">
      <div className="engineer-card__header">
        <div className="engineer-card__main">
          <p className="engineer-card__eyebrow">Engineer</p>

          <h3 className="engineer-card__title">{engineer.fullName}</h3>

          <p className="engineer-card__email">{engineer.email}</p>
        </div>

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

      <dl className="engineer-card__meta">
        <div className="engineer-card__meta-item">
          <dt>Max tasks / day</dt>
          <dd>{engineer.maxTasksPerDay}</dd>
        </div>
      </dl>
    </article>
  );
}