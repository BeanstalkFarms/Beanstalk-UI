// APY CALCULATIONS:
// Read this -> https://bean.money/docs/apy
// Essentially we take the bps (Beans per Season) as a constant based on the average number of new Farmable Beans over the past X Season (7 days or 30 days).
// Then, we simulate Beanstalk for a year and see how many Beans, Stalk and Seeds a Farmer would have in a year if they Deposited 1 Bean or 1 LP this season.
export const getAPY = (hours: number, bps: number, s0: number, S0: number, K0: number) => {
    const b = [1 + s0];
    const k = [1];
    const K = [S0];
    const S = [K0];

    for (let i = 0; i < hours; i += 1) {
        const newBeans = bps * k[i] / K[i];
        S.push(S[i] + 2 * bps);
        b.push(b[i] + newBeans);
        k.push(k[i] + newBeans + b[i] / 5000);
        K.push(K[i] + bps + S[i] / 10000);
    }
    return (b[hours] - 1 - s0) * 100;
};

export const getAPYs = (beansPerSeason: number, S0: number, K0: number) => {
    const beanAPY = getAPY(8760, beansPerSeason, 0, S0, K0);
    const lpAPY = getAPY(8760, beansPerSeason, 1, S0, K0);
    return [beanAPY, lpAPY];
};
