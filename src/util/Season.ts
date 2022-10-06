/**
 * Sort Season data points from oldest to newest.
 * If two data points have the same season, use the included `date`.
 */

type SortableSeasonDataPoint = {
  season: number;
  date?: Date;
  timestamp?: string;
};
export const sortSeasons = <T extends SortableSeasonDataPoint>(a: T, b: T) => {
  if (a?.season && b?.season) {
    const diff = a.season - b.season; // 6074 - 6073 = +1 -> put a after b
    if (diff !== 0) return diff; //
  }
  if (a?.date && b?.date) {
    return a.date > b.date ? 1 : -1; // 8/8 > 8/7 => +1 -> put a after b
  }
  if (a?.timestamp && b?.timestamp) {
    return new Date(a.timestamp) > new Date(b.timestamp) ? 1 : -1; // 8/8 > 8/7 => +1 -> put a after b
  }
  return 0;
};
