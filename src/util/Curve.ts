import curve from "@curvefi/api";

export async function initCurve() {
  await curve.init('Alchemy', { apiKey: 'f06l9TnsZyxvF0JaPzjoWQ_6baS5hEQs' }, { chainId: 1 });
  await Promise.all([
    curve.fetchFactoryPools(),
    curve.fetchCryptoFactoryPools(),
  ]);
  return curve;
};

export default curve;