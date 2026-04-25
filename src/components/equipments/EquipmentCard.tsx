import type { Equipment, EquipmentSeasonType } from '../../types/equipment';
import './EquipmentCard.css';

interface EquipmentCardProps {
  equipment: Equipment;
}

const monthLabels: Record<number, string> = {
  1: 'Jan',
  2: 'Feb',
  3: 'Mar',
  4: 'Apr',
  5: 'May',
  6: 'Jun',
  7: 'Jul',
  8: 'Aug',
  9: 'Sep',
  10: 'Oct',
  11: 'Nov',
  12: 'Dec',
};

function formatActiveMonths(activeMonths?: number[] | null): string {
  if (!activeMonths?.length) {
    return '-';
  }

  const validMonths = activeMonths
    .filter((month) => Number.isInteger(month) && month >= 1 && month <= 12)
    .map((month) => monthLabels[month]);

  return validMonths.length > 0 ? validMonths.join(', ') : '-';
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
      return 'equipment-summary-card__season--universal';
    default:
      return '';
  }
}

export default function EquipmentCard({ equipment }: EquipmentCardProps) {
  const seasonLabel = formatSeasonType(equipment.seasonType);

  return (
    <article className="equipment-summary-card">
      <div className="equipment-summary-card__header">
        <div className="equipment-summary-card__identity">
        

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

            <p className="equipment-summary-card__code">{equipment.code}</p>
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
          <dt>Engineer</dt>
          <dd>{equipment.assignedEngineerName || '-'}</dd>
        </div>

        <div className="equipment-summary-card__meta-row">
          <dt>Recurrence</dt>
          <dd>{equipment.recurrencePerYear ? `${equipment.recurrencePerYear} / year` : '-'}</dd>
        </div>

        <div className="equipment-summary-card__meta-row equipment-summary-card__meta-row--wide">
          <dt>Active months</dt>
          <dd>{formatActiveMonths(equipment.activeMonths)}</dd>
        </div>
      </dl>
    </article>
  );
}