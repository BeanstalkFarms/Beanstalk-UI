import React, { Fragment } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import { CryptoAsset, displayBN, displayFullBN, TokenLabel } from 'util/index';
import { DataBalanceModule, TokenTypeImageModule } from '.';

export default function TokenBalanceModule(props) {
  const style = {
    color: props.balanceColor,
    display: 'inline',
    fontFamily: 'Lucida Console',
    fontWeight: '400',
    lineHeight: '100%',
    margin: '2px',
  };
  const imageStyle = {
    display: 'inline-block',
    height: '20px',
    marginBottom: '-5px',
    marginLeft: '5px',
  };

  let balanceStyle = { color: props.balanceColor };

  if (props.claimPadding !== undefined) {
    balanceStyle = {
      color: props.balanceColor,
      paddingRight: '0px',
      textAlign: 'center',
      width: '100%',
    };
  }

  const width = window.innerWidth;

  const tokenLabel = TokenLabel(props.token);
  const content =
    width > 360 ? (
      <>
        <h5 style={style}>{displayBN(props.balance)}</h5>
        <TokenTypeImageModule style={imageStyle} token={props.token} />
      </>
    ) : (
      <>
        <h5 style={style}>{displayBN(props.balance)}</h5>
      </>
    );

  function displayLP(balance) {
    return `${displayBN(balance[0])} ${TokenLabel(
      CryptoAsset.Bean
    )}/${displayBN(balance[1])} ${TokenLabel(CryptoAsset.Ethereum)}`;
  }

  let balanceContent = props.balance.isGreaterThan(0)
    ? `${displayFullBN(props.balance)} ${TokenLabel(props.token)}`
    : undefined;
  balanceContent =
    props.balance.isGreaterThan(0) && props.isLP
      ? displayLP(props.poolForLPRatio(props.balance))
      : balanceContent;

  return (
    <Box style={{ position: 'relative' }}>
      <DataBalanceModule
        balanceDescription={balanceContent}
        content={content}
        description={props.description}
        style={balanceStyle}
        title={props.title === undefined ? tokenLabel : props.title}
        token={props.token}
        widthTooltip={props.widthTooltip}
        {...props}
      />
    </Box>
  );
}

TokenBalanceModule.defaultProps = {
  balance: new BigNumber(-1),
  balanceColor: 'black',
  endText: '',
  startText: '',
};
