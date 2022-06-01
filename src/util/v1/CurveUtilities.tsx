import { beanstalkContract } from '../index';
import { handleCallbacks, TxnCallbacks } from '../TxnUtilities';

// Deposit a token
// function deposit(address token, uint256 amount) external;
export const deposit = async (
  amount,
  addy,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().deposit(addy, amount),
  { onResponse }
);

// Withdraw a token
// function withdrawTokenBySeason(address token, uint32 season, uint256 amount)
// function withdrawTokenBySeasons(address token, uint32[] calldata seasons, uint256[] calldata amounts)
export const withdraw = async (
  seasons,
  amounts,
  addy,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  (seasons.length === 1) ?
  beanstalkContract().withdrawTokenBySeason(addy, seasons[0], amounts[0]) :
  beanstalkContract().withdrawTokenBySeasons(addy, seasons, amounts),
  { onResponse }
);

// Claim token
// function claimTokenBySeason(address token, uint32 season) public
// function claimTokenBySeasons(address token, uint32[] calldata seasons)
export const claimSeasons = async (
  seasons,
  addy,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  (seasons.length === 1) ?
  beanstalkContract().claimTokenBySeason(addy, seasons[0]) :
  beanstalkContract().claimTokenBySeasons(addy, seasons),
  { onResponse }
);

// FIXME
// Claim tokens
// function claimTokensBySeason(SeasonClaim[] calldata claims)
// function claimTokensBySeasons(SeasonsClaim[] calldata claims)
// struct SeasonClaim {
//    address token;
//    uint32 season;
// }
// struct SeasonsClaim {
//   address token;
//   uint32[] seasons;
// }
export const claimTokensBySeason = async (
  SeasonsClaim,
  claims,
  addy,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  (SeasonsClaim.seasons.length === 1) ?
  beanstalkContract().claimTokenBySeason(addy, SeasonsClaim.seasons[0]) :
  beanstalkContract().claimTokenBySeasons(addy, SeasonsClaim.seasons),
  { onResponse }
);
