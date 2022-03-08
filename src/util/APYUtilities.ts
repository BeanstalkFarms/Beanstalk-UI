// APY CALCULATIONS:
// Read this -> https://bean.money/docs/apy
// Essentially we take the bps (Beans per Season) as a constant based on the average number of new Farmable Beans over the past X Season (7 days or 30 days).
// Then, we simulate Beanstalk for a year and see how many Beans, Stalk and Seeds a Farmer would have in a year if they Deposited 1 Bean or 1 LP this season.
export type APYTuple = [
  apyInBeans: number,
  apyInStalk: number,
];

export const getAPY = (
  hours: number,
  /** Number of beans minted per season. */
  bps: number,
  /** BDV of hypothetical deposit */
  s0: number,
  /** Current: total amount of Stalk outstanding */
  S0: number,
  /** Current: total amoutn of Seeds outstanding */
  K0: number
) : APYTuple => {
  // Initialize sequence
  const b = [1 + s0]; // User BDV balance
  const k = [1];      // User Stalk balance
  const K = [S0];     // Total Stalk
  const S = [K0];     // Total Seeds

  for (let i = 0; i < hours; i += 1) {
    const ownership = k[i] / K[i];            // User: percent ownership (ratio of stalk owned)
    const newBeans = bps * ownership;         // User: number of Beans received this season
    S.push(S[i] + 2 * bps);                   // Total Stalk
    b.push(b[i] + newBeans);                  // User Beans
    k.push(k[i] + newBeans + b[i] / 5000);    // User Seeds
    K.push(K[i] + bps + S[i] / 10000);        // Total Seeds
  }

  return [
    (b[hours] - 1 - s0) * 100,  // User Beans: final value - initial deposit
    (k[hours] - 1) * 100        // User Stalk: 
  ];
};

export const getAPYs = (
  /** Historical: Number of beans minted per season. */
  beansPerSeason: number,
  /** Current: amount of Stalk outstanding */
  S0: number,
  /** Current: amount of Seeds outstanding */
  K0: number
): [beanAPY: APYTuple, lpAPY: APYTuple] => {
  const beanAPY = getAPY(8760, beansPerSeason, 0, S0, K0);
  const lpAPY   = getAPY(8760, beansPerSeason, 1, S0, K0);
  return [beanAPY, lpAPY];
};
