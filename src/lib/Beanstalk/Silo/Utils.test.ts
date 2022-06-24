import Beanstalk from '..';
import { depositedCrates } from './Withdraw.test';

it('sorts crates by descending Season', () => {
  const sorted = Beanstalk.Silo.Utils._sortCratesBySeasonDescending(depositedCrates);
  expect(sorted.length).toBe(2);
  expect(sorted[0].season.toNumber()).toBe(77);
  expect(sorted[1].season.toNumber()).toBe(24);
});
