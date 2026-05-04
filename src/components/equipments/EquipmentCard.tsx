import type { Equipment, EquipmentSeasonType } from '../../types/equipment';
import './EquipmentCard.css';

interface EquipmentCardProps {
  equipment: Equipment;
  onEdit?: (equipment: Equipment) => void;
  onDelete?: (equipment: Equipment) => void;
}

function formatSeasonType(seasonType: EquipmentSeasonType): string {
  switch (seasonType) {
    case 'HEAT':
      return 'Heating';
    case 'COLD':
      return 'Cooling';
    case 'UNIVERSAL':
      return 'All year';
    default:
      return '-';
  }
}

function getSeasonClass(seasonType: EquipmentSeasonType): string {
  switch (seasonType) {
    case 'HEAT':
      return 'equipment-summary-card__season--heat';
    case 'COLD':
      return 'equipment-summary-card__season--cold';
     case 'UNIVERSAL':
      return 'equipment-summary-card__season--all-year';
    default:
      return '';
  }
}

function formatDate(value?: string): string {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export default function EquipmentCard({
  equipment,
  onEdit,
  onDelete,
}: EquipmentCardProps) {
  const seasonLabel = formatSeasonType(equipment.seasonType);

  return (
    <article className="equipment-summary-card">
      <div className="equipment-summary-card__header">
        <div className="equipment-summary-card__identity">
          <div className="equipment-summary-card__icon">
            {equipment.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="equipment-summary-card__main">
            <div className="equipment-summary-card__topline">
              <span className="equipment-summary-card__eyebrow">Equipment</span>

              <span
                className={`equipment-summary-card__season ${getSeasonClass(
                  equipment.seasonType,
                )}`}
              >
                {seasonLabel}
              </span>
            </div>

            <h3 className="equipment-summary-card__title">{equipment.name}</h3>

            <p className="equipment-summary-card__location">
              {equipment.code}
            </p>
          </div>
        </div>

        <span
          className={
            equipment.active
              ? 'equipment-summary-card__status equipment-summary-card__status--active'
              : 'equipment-summary-card__status equipment-summary-card__status--inactive'
          }
        >
          {equipment.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <dl className="equipment-summary-card__meta">
        <div className="equipment-summary-card__meta-row">
          <dt>Inspection interval</dt>
          <dd>{equipment.frequencyPerYear}</dd>
        </div>

        <div className="equipment-summary-card__meta-row">
          <dt>Season</dt>
          <dd>{seasonLabel}</dd>
        </div>

        <div className="equipment-summary-card__meta-row">
          <dt>Code</dt>
          <dd>{(equipment.code)}</dd>
        </div>
      </dl>

      {(onEdit || onDelete) && (
        <footer className="equipment-summary-card__actions">
          {onEdit && (
            <button
              type="button"
              className="equipment-summary-card__button equipment-summary-card__button--secondary"
              onClick={() => onEdit(equipment)}
            >
              Edit
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              className="equipment-summary-card__button equipment-summary-card__button--danger"
              onClick={() => onDelete(equipment)}
            >
              Delete
            </button>
          )}
        </footer>
      )}
    </article>
  );
}