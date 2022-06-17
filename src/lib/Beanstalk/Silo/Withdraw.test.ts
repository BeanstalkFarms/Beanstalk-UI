import BigNumber from 'bignumber.js';
import { BEAN_TO_SEEDS } from 'constants/index';
import { BEAN } from 'constants/tokens';
import { DepositCrate } from 'state/farmer/silo';
import Beanstalk from '../index';

type WResult = ReturnType<typeof Beanstalk.Silo.Withdraw._selectCratesToWithdraw>;

// Setup
const currentSeason = new BigNumber(100);
const depositedCrates = [
  // Deposit: 10 Beans in Season 24
  {
    season: new BigNumber(24),
    amount: new BigNumber(10),
    bdv:    new BigNumber(10),
    stalk:  new BigNumber(10),
    seeds:  new BigNumber(20),
  },
  // Deposit: 5 Beans in Season 77
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
  expect(sorted[0].season.toNumber()).toBe(77);
  expect(sorted[1].season.toNumber()).toBe(24);
});

it('selects a single Deposit crate to Withdraw', () => {
  const withdrawAmount = new BigNumber(2);

  // Expected results
  const expectedBdvRemoved   = withdrawAmount;
  const expectedSeedsRemoved = new BigNumber(4);
  const expectedStalkRemoved = new BigNumber(2).plus(expectedSeedsRemoved.times(100 - 77).times(0.00001));
  const result = Beanstalk.Silo.Withdraw._selectCratesToWithdraw(
    BEAN[1],
    withdrawAmount,
    depositedCrates,
    currentSeason
  );

  expect(result)
    .toStrictEqual({
      deltaAmount: withdrawAmount.negated(),
      deltaStalk:  expectedStalkRemoved.negated(),
      deltaCrates: [{
        season: new BigNumber(77),
        amount: withdrawAmount.negated(),
        bdv:    expectedBdvRemoved.negated(),
        stalk:  expectedStalkRemoved.negated(),
        seeds:  expectedSeedsRemoved.negated(),
      }],
    } as WResult);
});

it('selects multiple Deposit Crates to Withdraw', () => {
  const withdrawAmount = new BigNumber(12);
  
  // Expected results
  const expectedStalkRemoved77 = new BigNumber(5).plus(new BigNumber(10 * (100 - 77)).times(0.00001));
  const expectedStalkRemoved24 = new BigNumber(7).plus(new BigNumber(14 * (100 - 24)).times(0.00001));
  const expectedStalkRemoved = expectedStalkRemoved77.plus(expectedStalkRemoved24);
  const result = Beanstalk.Silo.Withdraw._selectCratesToWithdraw(
    BEAN[1],
    withdrawAmount,
    depositedCrates,
    currentSeason
  );

  expect(result)
    .toStrictEqual({
      deltaAmount: withdrawAmount.negated(),
      deltaStalk:  expectedStalkRemoved.negated(),
      deltaCrates: [
        // All of the most recent crate is now removed.
        {
          season: new BigNumber(77),
          amount: new BigNumber(5).negated(),
          bdv:    new BigNumber(5).negated(),
          stalk:  expectedStalkRemoved77.negated(),
          seeds:  new BigNumber(10).negated()
        },
        // Part of the older crate is removed.
        {
          season: new BigNumber(24),
          amount: new BigNumber(7).negated(),
          bdv:    new BigNumber(7).negated(),
          stalk:  expectedStalkRemoved24.negated(),
          seeds:  new BigNumber(14).negated()
        }
      ],
    } as WResult);
});
