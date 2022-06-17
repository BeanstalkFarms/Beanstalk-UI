import { Token } from 'classes';
import { BEAN_TO_SEEDS } from 'constants/index';
import { FormState } from 'components/Common/Form';
// import { Action, ActionType } from 'util/Actions';
import { Crate, DepositCrate } from 'state/farmer/silo';
import BigNumber from 'bignumber.js';

export default class SiloWithdraw {
  /**
   * Summarize the Actions that will occur when making a Withdrawal.
   * This includes pre-deposit Swaps, the Deposit itself, and resulting
   * rewards removed by Beanstalk depending on the destination of Withdrawal.
   * 
   * @param from A Whitelisted Silo Token which the Farmer is Withdrawing.
   * @param tokens Input Tokens to Deposit. Could be multiple Tokens.
   */
  static withdraw(
    from: Token,
    tokens: FormState['tokens'],
    depositedCrates: DepositCrate[],
    currentSeason: BigNumber,
  ) {
    if (tokens.length > 1) throw new Error('Multi-token Withdrawal is currently not supported.');
    if (!tokens[0].amount) return null;

    const withdrawAmount = tokens[0].amount;
    const { deltaAmount, deltaStalk, deltaCrates } = SiloWithdraw._selectCratesToWithdraw(
      withdrawAmount,
      depositedCrates,
      currentSeason,
    );
    
    return {
      bdv: deltaAmount,
      stalk: deltaStalk,
      seeds: from.getSeeds(deltaAmount),
      actions: [],
      deltaCrates,
    };
  }

  // ----------------------------------------------------------------------

  /**
   * Order crates by Season, in descending order.
   */
  static _sortCratesBySeasonDescending(crates: Crate[]) {
    return [...crates].sort((a, b) => b.season.toNumber() - a.season.toNumber());
  }

  /**
   * Select how much to Withdraw from Crates.
   * Calculate the Stalk and Seeds lost for Withdrawing
   * the selected Crates.
   * 
   * @returns totalAmountRemoved  
   * @returns totalStalkRemoved   
   * @returns removedCrates       
   */
  static _selectCratesToWithdraw(
    amount: BigNumber,
    depositedCrates: DepositCrate[],
    currentSeason: BigNumber,
  ) {
    let totalAmountRemoved = new BigNumber(0);
    let totalStalkRemoved  = new BigNumber(0);
    const deltaCrates : (Partial<DepositCrate>)[] = [];
    const sortedCrates = SiloWithdraw._sortCratesBySeasonDescending(depositedCrates);

    sortedCrates.some((crate) => {
      // How much to remove from the current crate.
      const crateAmountToRemove = (
        totalAmountRemoved.plus(crate.amount).isLessThanOrEqualTo(amount)
          ? crate.amount                       // remove the entire crate
          : amount.minus(totalAmountRemoved)   // remove the remaining amount
      );

      // Estimating the Stalk lost based on the delta between
      // the current season and the season of Deposit.
      const crateStalkToRemove = (
        crateAmountToRemove
          .multipliedBy(currentSeason.minus(crate.season))
          .multipliedBy(BEAN_TO_SEEDS)
      );

      totalAmountRemoved = totalAmountRemoved.plus(crateAmountToRemove);
      totalStalkRemoved  = totalStalkRemoved.plus(crateStalkToRemove);
      deltaCrates.push({
        season: crate.season,
        amount: crateAmountToRemove.negated(),
        stalk:  crateStalkToRemove.negated(),
      });

      // Finish when...
      return totalAmountRemoved.isEqualTo(amount);
    });

    return {
      deltaStalk:  totalStalkRemoved.negated(),
      deltaAmount: totalAmountRemoved.negated(),
      deltaCrates,
    };
  }
}
