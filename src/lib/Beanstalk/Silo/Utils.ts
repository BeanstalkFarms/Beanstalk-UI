import { Crate, DepositCrate } from 'state/farmer/silo';

/**
 * Order crates by Season, in descending order.
 */
export function _sortCratesBySeason<T extends Crate>(crates: T[], direction : 'asc' | 'desc' = 'desc') {
  const m = direction === 'asc' ? -1 : 1;
  return [...crates].sort((a, b) => m * (b.season.toNumber() - a.season.toNumber()));
}
