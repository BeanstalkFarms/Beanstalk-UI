import BigNumber from 'bignumber.js';
import { displayBN, SwapMode } from '../../util';

export default function TransactionTextModule({
  buyBeans,
  buyEth,
  mode,
  sellToken,
  sellEth,
  updateExpectedPrice,
  value,
}) {
  if (!(mode === SwapMode.Ethereum || mode === SwapMode.BeanEthereum)) {
    if (sellToken !== undefined && buyEth.isGreaterThan(0)) {
      return (
        `Buy ${displayBN(buyEth)} ETH with ${sellToken.toFixed(
          3
        )} ${sellToken.isEqualTo(1) ? 'Bean' : 'Beans'} for $${updateExpectedPrice(
          buyEth.multipliedBy(-1),
          sellToken.multipliedBy(-1)
        ).toFixed(4)} each`
      );
    }
    return '';
  }

  if (
    mode === SwapMode.Ethereum ||
    mode === SwapMode.BeanEthereum
  ) {
    if (buyBeans.isGreaterThan(0)) {
      return (
        `Buy ${displayBN(buyBeans)}
        ${buyBeans.isEqualTo(1) ? 'Bean' : 'Beans'} ${sellEth !== undefined
          ? `with ${sellEth.toFixed(4)} ETH `
          : null
        }for $${updateExpectedPrice(
          sellEth !== undefined
            ? sellEth
            : value,
          buyBeans
        ).toFixed(4)} each`
      );
    }
  return '';
  }
}

TransactionTextModule.defaultProps = {
  buyBeans: new BigNumber(0),
  buyEth: new BigNumber(0),
};
