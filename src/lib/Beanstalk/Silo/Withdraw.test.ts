import BigNumber from 'bignumber.js';
import { BEAN_TO_SEEDS } from 'constants/index';
import { DepositCrate } from 'state/farmer/silo';
import Beanstalk from '../index';

type WResult = ReturnType<typeof Beanstalk.Silo.Withdraw._selectCratesToWithdraw>;

// Setup
const currentSeason = new BigNumber(100);
const depositedCrates = [
  {
    season: new BigNumber(24),
    amount: new BigNumber(10),
    bdv:    new BigNumber(10),
    stalk:  new BigNumber(10),
    seeds:  new BigNumber(20),
  },
  {
    season: new BigNumber(77),
    amount: new BigNumber(5),
    bdv:    new BigNumber(5),
    stalk:  new BigNumber(5),
    seeds:  new BigNumber(10),
  }
] as DepositCrate[];

// --------------------------------------------------------

it('sorts crates by descending Season', () => {
  const sorted = Beanstalk.Silo.Withdraw._sortCratesBySeasonDescending(depositedCrates);
  expect(sorted.length).toBe(2);
  expect(sorted[0].season.toString()).toBe('77');
  expect(sorted[1].season.toString()).toBe('24');
});

it('selects a single deposit crate to withdraw', () => {
  const withdrawAmount = new BigNumber(2);
  // 46 = (2) * (season 100 - season 77)
  const removedStalk  = new BigNumber(46).times(BEAN_TO_SEEDS); // FIXME: why BEAN_TO_SEEDS?

  const result = Beanstalk.Silo.Withdraw._selectCratesToWithdraw(withdrawAmount, depositedCrates, currentSeason);
  expect(result)
    .toStrictEqual({
      deltaAmount: withdrawAmount.negated(),
      deltaStalk:  removedStalk.negated(),
      deltaCrates: [{
        season: new BigNumber(77),
        amount: withdrawAmount.negated(),
        stalk:  removedStalk.negated(),
      }],
    } as WResult);
});

it('selects multiple deposit crates to withdraw', () => {
  const withdrawAmount = new BigNumber(10);
  // 495 = 5*(100-77) + 5*(100-24)
  const removedStalk  = new BigNumber(495).times(BEAN_TO_SEEDS);

  const result = Beanstalk.Silo.Withdraw._selectCratesToWithdraw(withdrawAmount, depositedCrates, currentSeason);
  expect(result)
    .toStrictEqual({
      deltaAmount: withdrawAmount.negated(),
      deltaStalk:  removedStalk.negated(),
      deltaCrates: [
        // All of the most recent crate is now removed.
        {
          season: new BigNumber(77),
          amount: new BigNumber(5).negated(),
          stalk:  new BigNumber(5 * (100 - 77)).times(BEAN_TO_SEEDS).negated(),
        },
        // Part of the older crate is removed.
        {
          season: new BigNumber(24),
          amount: new BigNumber(5).negated(),
          stalk:  new BigNumber(5 * (100 - 24)).times(BEAN_TO_SEEDS).negated(),
        }
      ],
    } as WResult);
});
