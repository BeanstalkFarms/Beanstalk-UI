// @publius - know we're likely going to scrap apy,
// but annotation of what's going on here would be appreciated
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
