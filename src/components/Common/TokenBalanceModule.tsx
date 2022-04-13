import React, { Fragment } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@mui/material';
import { CryptoAsset, displayBN, displayFullBN, Token, TokenLabel } from 'util/index';
import { DataBalanceModule, TokenTypeImageModule } from '.';

const style = {
  display: 'inline',
  fontFamily: 'Lucida Console',
  fontWeight: '400',
  lineHeight: '100%',
  margin: '2px',
  fontSize: '11px',
};
const imageStyle = {
  display: 'inline-block',
  height: '18px',
  marginBottom: '-5px',
  marginLeft: '5px',
};

type TokenBalanceModuleProps = {
  isCurve: boolean;
  isLP: boolean;
  description: string;
  balance: BigNumber;
  poolForLPRatio: Function;
  balanceColor?: string;
  token: Token;
  title?: string;
}

export default function TokenBalanceModule(props: TokenBalanceModuleProps) {
  const width = window.innerWidth;
  const tokenLabel = TokenLabel(props.token);
  const content = (width > 360) ? (
    <>
      <h5 style={style}>{displayBN(props.balance)}</h5>
      <TokenTypeImageModule style={imageStyle} token={props.token} />
    </>
  ) : (
    <h5 style={style}>{displayBN(props.balance)}</h5>
  );

  function displayLP(balance : [BigNumber, BigNumber]) {
    if (props.isCurve) {
      return `${displayBN(balance[0])} BEAN/${displayBN(balance[1])} 3CRV`;
    }
    return `${displayBN(balance[0])} BEAN/${displayBN(balance[1])} ${TokenLabel(CryptoAsset.Ethereum)}`;
  }

  const balanceContent = props.balance.isGreaterThan(0)
    ? (
      props.isLP
        ? `${displayLP(props.poolForLPRatio(props.balance))}` 
        : `${displayFullBN(props.balance)} ${TokenLabel(props.token)}`
    ) : undefined;

  return (
    <Box style={{ position: 'relative' }}>
      <DataBalanceModule
        balanceDescription={balanceContent}
        content={content}
        description={props.description}
        style={{ color: props.balanceColor }}
        title={props.title === undefined ? tokenLabel : props.title}
        token={props.token}
        widthTooltip={props.widthTooltip}
        {...props}
      />
    </Box>
  );
}
