import BigNumber from 'bignumber.js';
import { displayBN } from '../../util';

export default function ClaimTextModule({
  claim,
  claimableEthBalance,
  lpReceivableBalance,
  beanReceivableBalance,
  harvestablePodBalance,
}) {
  const claimTextList = [];
  let claimText = '';

  if (claimableEthBalance.isGreaterThan(0)) {
    claimTextList.push(
      `${claimableEthBalance.toFixed(3)} ETH`
    );
  }
  if (lpReceivableBalance.isGreaterThan(0)) {
    claimTextList.push(
      `${displayBN(lpReceivableBalance)} LP Tokens`
    );
  }
  if (beanReceivableBalance.isGreaterThan(0)) {
    claimTextList.push(
      `${displayBN(beanReceivableBalance)} Beans`
    );
  }
  if (harvestablePodBalance.isGreaterThan(0)) {
    claimTextList.push(
      `${displayBN(harvestablePodBalance)} Pods`
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
  claimableEthBalance: new BigNumber(-1),
  beanReceivableBalance: new BigNumber(-1),
  lpReceivableBalance: new BigNumber(-1),
  harvestablePodBalance: new BigNumber(-1),
};
