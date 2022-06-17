import { DepositCrate } from "state/farmer/silo";

/**
 * Order crates by Season, in descending order.
 */
export function _sortCratesBySeasonDescending(crates: DepositCrate[]) {
  return [...crates].sort((a, b) => b.season.toNumber() - a.season.toNumber());
}