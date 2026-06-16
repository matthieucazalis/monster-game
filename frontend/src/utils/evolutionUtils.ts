/* stade evolution tout les 1/3 du level max */

export function getEvolutionStage(level: number, maxLevel: number): 1 | 2 | 3 {
  const third = maxLevel / 3;
  if (level <= third) return 1;
  if (level <= third * 2) return 2;
  return 3;
}

export function getMonsterImageUrl(
  baseImageUrl: string,
  level: number,
  maxLevel: number,
): string {
  const stage = getEvolutionStage(level, maxLevel);
  return `${baseImageUrl}_${stage}.png`;
}
