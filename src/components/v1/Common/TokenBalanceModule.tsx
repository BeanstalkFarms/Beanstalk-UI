import React, { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { CryptoAsset, displayBN, displayFullBN, Token, TokenLabel } from 'util/index';
import { DataBalanceModule, TokenTypeImageModule } from '.';

type TokenBalanceModuleProps = {
  isCurve?: boolean;
  isLP?: boolean;
  isBeanlusd?: boolean;
  description: string;
  balance: BigNumber;
  poolForLPRatio: Function;
  balanceColor?: string;
  token: Token;
  title?: string;
}

const useStyles = makeStyles({
  balance: {
    display: 'inline',
    fontFamily: 'Lucida Console',
    fontWeight: '400',
    lineHeight: '100%',
    margin: '2px',
    fontSize: '11px',
  },
  tokenImage: {
    display: 'inline-block',
    height: '18px',
    marginBottom: '-5px',
    marginLeft: '5px',
  }
});

export default function TokenBalanceModule(props: TokenBalanceModuleProps) {
  const classes = useStyles();
  const tokenLabel = TokenLabel(props.token);

  //
  const isCurve = props.isCurve;
  const isBeanlusd = props.isBeanlusd;
  const width = window.innerWidth;
  const content = (width > 360) ? (
    <>
      <h5 className={classes.balance}>{displayBN(props.balance)}</h5>
      <TokenTypeImageModule className={classes.tokenImage} token={props.token} />
    </>
  ) : (
    <h5 className={classes.balance}>{displayBN(props.balance)}</h5>
  );

  const displayLP = useMemo(() => (balance : [BigNumber, BigNumber]) => {
    if (isCurve) return `${displayBN(balance[0])} BEAN/${displayBN(balance[1])} 3CRV`;
    if (isBeanlusd) return `${displayBN(balance[0])} BEAN/${displayBN(balance[1])} LUSD`;
    return `${displayBN(balance[0])} BEAN/${displayBN(balance[1])} ${TokenLabel(CryptoAsset.Ethereum)}`;
  }, [isCurve, isBeanlusd]);

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
