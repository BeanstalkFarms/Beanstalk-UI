import Beanstalk from '..';
import { depositedCrates } from './Withdraw.test';

it('sorts crates by descending Season', () => {
  const sorted = Beanstalk.Silo.Utils._sortCratesBySeason(depositedCrates);
  expect(sorted.length).toBe(2);
  expect(sorted[0].season.toNumber()).toBe(77);
  expect(sorted[1].season.toNumber()).toBe(24);
});

it('sorts crates by ascending Season', () => {
  const sorted = Beanstalk.Silo.Utils._sortCratesBySeason(depositedCrates, 'asc');
  expect(sorted.length).toBe(2);
  expect(sorted[0].season.toNumber()).toBe(24);
  expect(sorted[1].season.toNumber()).toBe(77);
});