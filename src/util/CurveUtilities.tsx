import { CURVE } from 'constants/index';
import { account, beanstalkContract } from './index';
import { handleCallbacks, TxnCallbacks } from './TxnUtilities';

// Deposit a token
// function deposit(address token, uint256 amount) external;
export const deposit = async (
  amount,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().deposit(CURVE.addr, amount),
  { onResponse }
);

// Withdraw a token
// function withdraw(address token, uint32[] calldata seasons, uint256[] calldata amounts);
export const withdraw = async (
  seasons,
  amounts,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().withdraw(CURVE.addr, seasons, amounts),
  { onResponse }
);

// Claim tokens
// function claimWithdrawal(address token, uint32 _s) public returns (uint256 amount);
// function claimWithdrawals(address[] calldata tokens, uint32[] calldata withdrawals);
export const claimWithdrawals = async (
  withdrawals,
  onResponse: TxnCallbacks['onResponse']
) => {
  const tokens = [];
  Object.keys(withdrawals).forEach(() => {
    tokens.push(CURVE.addr);
  });

  return (
    handleCallbacks(
      (withdrawals.length === 1) ?
      beanstalkContract().claimWithdrawal(CURVE.addr, withdrawals[0]) :
      beanstalkContract().claimWithdrawals(tokens, withdrawals),
      { onResponse }
    )
  );
}
