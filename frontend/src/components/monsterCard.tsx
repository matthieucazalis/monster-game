import { useEffect, useState } from "react";
import { getMonsterImageUrl } from "../utils/evolutionUtils";
import "../pages/style/components.css";

interface MonsterCardProps {
  monster: {
    id: number;
    specie_id: number;
    level: number;
    stade: number;
    next_available_at: string | null;
    species_name: string;
    hunger_interval_hours: number;
    max_level: number;
    base_image_url: string;
  };
  onLevelUp: () => void;
}

function getTimeRemaining(nextAvailableAt: string | null): number {
  if (!nextAvailableAt) return 0;
  const next = new Date(nextAvailableAt).getTime();
  return Math.max(0, next - Date.now());
}

function getProgress(
  nextAvailableAt: string | null,
  intervalHours: number,
): number {
  if (!nextAvailableAt) return 100;
  const next = new Date(nextAvailableAt).getTime();
  const intervalMs = intervalHours * 60 * 60 * 1000;
  const start = next - intervalMs;
  const now = Date.now();
  const elapsed = now - start;
  return Math.min(100, Math.max(0, (elapsed / intervalMs) * 100));
}

function formatTime(ms: number): string {
  if (ms <= 0) return "Ready !";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}min ${s}s`;
  if (m > 0) return `${m}min ${s}s`;
  return `${s}s`;
}

export default function MonsterCard({ monster, onLevelUp }: MonsterCardProps) {
  const [remaining, setRemaining] = useState(() =>
    getTimeRemaining(monster.next_available_at),
  );
  const [progress, setProgress] = useState(() =>
    getProgress(monster.next_available_at, monster.hunger_interval_hours),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getTimeRemaining(monster.next_available_at));
      setProgress(
        getProgress(monster.next_available_at, monster.hunger_interval_hours),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [monster.next_available_at, monster.hunger_interval_hours]);

  const canLevelUp = remaining <= 0;
  const imageUrl = getMonsterImageUrl(
    monster.base_image_url,
    monster.level,
    monster.max_level,
  );

  return (
    <div className="monster-display">
      {/* Barre de titre Windows 98 */}
      <div className="monster-titlebar">
        <span className="monster-titlebar-label">{monster.species_name}</span>
        <div className="monster-titlebar-btns">
          <button className="monster-win-btn">_</button>
          <button className="monster-win-btn">□</button>
          <button className="monster-win-btn">✕</button>
        </div>
      </div>

      {/* Corps de la fenêtre */}
      <div className="monster-body">
        <div
          className={`monster-image-wrap ${!canLevelUp ? "disabled" : ""}`}
          onClick={canLevelUp ? onLevelUp : undefined}
          title={
            canLevelUp
              ? "Cliquez pour monter de niveau !"
              : `Attendez encore ${formatTime(remaining)}`
          }
        >
          <img
            src={imageUrl}
            alt={monster.species_name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/species/placeholder.png";
            }}
          />
        </div>

        <hr className="monster-divider" />
        <h2 className="monster-name">{monster.species_name}</h2>

        <div className="timer-bar-wrap">
          <div className="timer-bar-fill" style={{ width: `${progress}%` }} />
          <span className="timer-bar-label">{formatTime(remaining)}</span>
        </div>

        <div className="monster-stats-row">
          <div className="monster-stat">Level : {monster.level}</div>
          <div className="monster-stat">Stade : {monster.stade}/3</div>
        </div>
      </div>
    </div>
  );
}
