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
  amount,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().withdraw(CURVE.addr, seasons, amount),
  { onResponse }
);

// Claim a token
// function claimWithdrawal(address account, address token, uint32 _s) public returns (uint256 amount);
export const claimWithdrawal = async (
  seasons,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().claimWithdrawal(account, CURVE.addr, seasons),
  { onResponse }
);

// Claim tokens
// function claimWithdrawals(address account, address[] calldata tokens, uint32[] calldata withdrawals);
export const claimWithdrawals = async (
  // address,
  withdrawals,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().claimWithdrawals(account, CURVE.addr, withdrawals),
  { onResponse }
);
