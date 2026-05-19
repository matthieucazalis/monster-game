import "../pages/style/components.css";

interface StatsBarProps {
  level: number;
  maxLevel: number;
  stade: number;
  speciesName: string;
}

export default function StatsBar({
  level,
  maxLevel,
  stade,
  speciesName,
}: StatsBarProps) {
  const progress = (level / maxLevel) * 100;

  return (
    <div className="stats-bar-wrap">
      <div className="stats-bar-header">
        <span className="stats-bar-name">{speciesName}</span>
        <span className="stats-bar-level">
          Lv. {level} / {maxLevel}
        </span>
      </div>

      <div className="stats-bar-track">
        <div className="stats-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="stats-bar-footer">
        <span className="stats-bar-stade">Stade {stade} / 3</span>
        <span className="stats-bar-percent">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
