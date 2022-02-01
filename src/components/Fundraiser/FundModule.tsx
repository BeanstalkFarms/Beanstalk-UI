import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Box } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import BigNumber from 'bignumber.js';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { USDC, BEAN } from '../../constants';
import {
  displayBN,
  MaxBN,
  MinBNs,
  fund,
  toStringBaseUnitBN,
  TokenLabel,
  TrimBN,
} from '../../util';
import {
  FarmAsset,
  InputFieldPlus,
  TokenOutputField,
  TransactionDetailsModule,
} from '../Common';

export const FundModule = forwardRef((props, ref) => {
  const [fromTokenValue, setFromTokenValue] = useState(new BigNumber(-1));
  const [toPodValue, setToPodValue] = useState(new BigNumber(0));

  const { weather, soil } = useSelector<
    AppState,
    AppState['weather']
  >((state) => state.weather);

  const {
    totalPods,
  } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  const maxFromVal = props.tokenBalance;
  const maxTokenVal = props.fundsRemaining;

  function fromValueUpdated(newFromNumber) {
    const newFromValue = MinBNs([newFromNumber, maxFromVal, maxTokenVal]);
    setFromTokenValue(TrimBN(newFromValue, 6));
    BigNumber.set({ DECIMAL_PLACES: 18 });
    const sowedBeans = MaxBN(newFromValue, new BigNumber(0));
    setToPodValue(
      TrimBN(
        sowedBeans.multipliedBy(
          new BigNumber(1).plus(weather.dividedBy(100))
        ),
        6
      )
    );
    props.setIsFormDisabled(sowedBeans.isLessThanOrEqualTo(0));
  }

  /* Input Fields */
  const fromTokenField = (
    <InputFieldPlus
      key={0}
      balance={props.tokenBalance}
      handleChange={(v) => fromValueUpdated(v)}
      token={props.asset}
      value={fromTokenValue}
    />
  );

  /* Output Fields */
  const toPodField = (
    <TokenOutputField
      key="pods"
      token={FarmAsset.Pods}
      value={toPodValue}
      decimals={BEAN.decimals}
      mint
    />
  );

  /* Transaction Details, settings and text */
  const beanOutput = MaxBN(fromTokenValue, new BigNumber(0));

  const details = [];
  if (fromTokenValue.isEqualTo(props.fundsRemaining)) {
    details.push(`Sow the remaining ${displayBN(beanOutput)} ${TokenLabel(props.asset)} with ${weather.toFixed()}% Weather`
    );
  } else {
    details.push(`Sow ${displayBN(beanOutput)} ${TokenLabel(props.asset)} with ${weather.toFixed()}% Weather`
    );
  }

  details.push(`Receive ${displayBN(toPodValue)} Pods at #${displayBN(
    totalPods
  )} in the Pod line`);

  const noFundsTextField = props.fundsRemaining.isEqualTo(0) ? (
    <Box style={{ marginTop: '-2px', fontFamily: 'Futura-PT-Book' }}>
      {`There is no more ${TokenLabel(props.asset)} to sow for the audit`}
    </Box>
  ) : null;
  function transactionDetails() {
    if (toPodValue.isLessThanOrEqualTo(0)) return null;

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        {toPodField}
        <TransactionDetailsModule fields={details} />
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (toPodValue.isLessThanOrEqualTo(0)) return;
      fund(
        props.id,
        toStringBaseUnitBN(fromTokenValue, USDC.decimals),
        () => {
          fromValueUpdated(new BigNumber(-1));
        }
      );
    },
  }));

  return (
    <>
      {fromTokenField}
      {noFundsTextField}
      {transactionDetails()}
    </>
  );
});
