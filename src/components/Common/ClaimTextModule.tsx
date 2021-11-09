import BigNumber from 'bignumber.js';
import { displayBN } from '../../util';

export default function ClaimTextModule(props) {
  const claimTextList = [];
  let claimText = '';

  if (props.claimableEthBalance.isGreaterThan(0)) {
    claimTextList.push(
      `${props.claimableEthBalance.toFixed(3)} ETH`
    );
  }
  if (props.lpReceivableBalance.isGreaterThan(0)) {
    claimTextList.push(
      `${displayBN(props.lpReceivableBalance)} LP Tokens`
    );
  }
  if (props.beanReceivableBalance.isGreaterThan(0)) {
    claimTextList.push(
      `${displayBN(props.beanReceivableBalance)} Beans`
    );
  }
  if (props.harvestablePodBalance.isGreaterThan(0)) {
    claimTextList.push(
      `${displayBN(props.harvestablePodBalance)} Pods`
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

  if (props.claim) {
    return `- Claim ${claimText}`;
  } return null;
}

ClaimTextModule.defaultProps = {
  claim: false,
  claimableEthBalance: new BigNumber(-1),
  beanReceivableBalance: new BigNumber(-1),
  lpReceivableBalance: new BigNumber(-1),
  harvestablePodBalance: new BigNumber(-1),
};
