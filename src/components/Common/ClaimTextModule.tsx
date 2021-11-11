import BigNumber from 'bignumber.js';
import { displayBN, smallDecimalPercent } from '../../util';

export default function ClaimTextModule({
  claim,
  beanClaimable,
  ethClaimable,
}) {
  const claimTextList = [];
  let claimText = '';

  const displayEthBalance = ethClaimable.isLessThan(0.0001) ?
    smallDecimalPercent(ethClaimable)
    : displayBN(ethClaimable);

  if (beanClaimable.isGreaterThan(0)) {
    claimTextList.push(
      `${displayBN(beanClaimable)} Beans`
    );
  }
  if (ethClaimable.isGreaterThan(0)) {
    claimTextList.push(
      `${displayEthBalance} ETH`
    );
  }

  if (claimTextList.length === 1) {
    claimText = `${claimTextList[0]}`;
  } else {
    /* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
    for (let i = 0; i < claimTextList.length; i++) {
      if (i === claimTextList.length - 1) {
        claimText += `and ${claimTextList[i]} `;
      } else {
        claimText += `${claimTextList[i]}, `;
      }
    }
  }

  if (claim) {
    return `Claim ${claimText}`;
  } return null;
}

ClaimTextModule.defaultProps = {
  claim: false,
  beanClaimable: new BigNumber(-1),
  ethClaimable: new BigNumber(-1),
};
