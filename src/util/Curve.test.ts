import curve, { initCurve } from './Curve';

beforeAll(() => {
  return initCurve();
});

it('can access basic functions like tvl', async () => {
  const tvl = await curve.getTVL();
  expect(tvl).toBeGreaterThan(0);
});

/**
 * Swap Types
 * ----------
 * 
 * remove_liquidity_one_coin
 *  10 = aave
 *  9  = others
 * 
 * add_liquidity
 *  8  = is_lending
 *  6  = underlying_coin_addresses.length === 2
 *    = underlying_coin_addresses.length !== 2 (presumably > 2)
 * 
 * "all meta swaps where input coin is meta"
 * "all meta swaps where input coin is NOT meta"
 *  5  = chainId = 137 && is_factory [also: swapAddress = poolData.swap_address]
 *  4  = is_crypto
 *  2  = not is_crypto
 * 
 * "underlying swap"
 *  4  = is_crypto && (is_fake || is_meta)
 *  3  = is_crypto
 *  2  = not is_crypto
 * 
 * "straight swap"
 *  3  = is_crypto
 *  1  = not is_crypto
 */

it('makes a "straight swap" route (USDT -> WBTC)', async () => {
  const { route, output } = await curve.router.getBestRouteAndOutput(
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
    '1000'
  );

  console.log(route, output);

  expect(route.length).toBe(1);
  expect(route[0].poolId).toBe('tricrypto2');
  expect(route[0].outputCoinAddress).toBe('0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'.toLowerCase())
  expect(route[0].swapType).toBe(3); // 
  expect(parseFloat(output)).toBeGreaterThan(0);
}, 10000);

it('makes a "underlying swap" route (USDT -> FRAX)', async () => {
  const { route, output } = await curve.router.getBestRouteAndOutput(
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0x853d955aCEf822Db058eb8505911ED77F175b99e', // FRAX
    '1000'
  );

  console.log(route, output);

  expect(route.length).toBe(1);
  expect(route[0].poolId).toBe('frax');
  expect(route[0].outputCoinAddress).toBe('0x853d955acef822db058eb8505911ed77f175b99e'.toLowerCase())
  expect(route[0].swapType).toBe(2); // 
  expect(parseFloat(output)).toBeGreaterThan(0);
}, 10000);

// Why is this called a straight swap and not an underlying swap?
it('makes a "straight swap" route of 3CRV reserve assets (USDT -> DAI)', async () => {
  const { route, output } = await curve.router.getBestRouteAndOutput(
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    '1000'
  );

  console.log(route, output);

  expect(route.length).toBe(1);
  expect(route[0].poolId).toBe('3pool');
  expect(route[0].outputCoinAddress).toBe('0x6B175474E89094C44Da98b954EedeAC495271d0F'.toLowerCase())
  expect(route[0].swapType).toBe(1); // 
  expect(parseFloat(output)).toBeGreaterThan(0);
}, 10000);