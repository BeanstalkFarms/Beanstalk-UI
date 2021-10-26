import React from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import { displayBN, SwapMode } from '../../util';

export default function TransactionTextModule(props) {
  const textStyle = {
    fontFamily: 'Futura-PT-Book',
  };

  if (!(props.mode === SwapMode.Ethereum || props.mode === SwapMode.BeanEthereum)) {
    if (props.sellToken !== undefined) {
      const textTransaction = (
        `- Buy ${displayBN(props.buyEth)} ETH with ${props.sellToken.toFixed(
          3
        )} ${props.sellToken.isEqualTo(1) ? 'Bean' : 'Beans'} for $${props.updateExpectedPrice(
          props.buyEth.multipliedBy(-1),
          props.sellToken.multipliedBy(-1)
        ).toFixed(4)} each`
      );

      return (
        <>
          {props.buyEth.isGreaterThan(0)
            ? <Box style={textStyle}>{textTransaction}</Box>
            : null
          }
        </>
      );
    }
    return null;
  }

  if (
    props.mode === SwapMode.Ethereum ||
    props.mode === SwapMode.BeanEthereum
  ) {
    const textTransaction = (
      `- Buy ${displayBN(props.buyBeans)}
      ${props.buyBeans.isEqualTo(1) ? 'Bean' : 'Beans'} ${props.sellEth !== undefined
        ? `with ${props.sellEth.toFixed(3)} ETH `
        : null
      }for $${props.updateExpectedPrice(
        props.sellEth !== undefined
          ? props.sellEth
          : props.value,
        props.buyBeans
      ).toFixed(4)} each`
    );

    return (
      <>
        {props.buyBeans.isGreaterThan(0)
          ? <Box style={textStyle}>{textTransaction}</Box>
          : null
        }
      </>
   );
  }
}

TransactionTextModule.defaultProps = {
  balance: new BigNumber(-1),
  buyBeans: new BigNumber(0),
  claim: false,
  claimableBalance: new BigNumber(0),
};
