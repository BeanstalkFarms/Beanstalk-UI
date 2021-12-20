import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Box } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'state';
import BigNumber from 'bignumber.js';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useLatestTransactionNumber } from 'state/general/hooks';
import {
  addTransaction,
  completeTransaction,
  State,
} from 'state/general/actions';
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
  const dispatch = useDispatch();
  const latestTransactionNumber = useLatestTransactionNumber();

  const { weather, soil } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );

  const { totalPods } = useSelector<AppState, AppState['totalBalance']>(
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
        sowedBeans.multipliedBy(new BigNumber(1).plus(weather.dividedBy(100))),
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
      handleChange={(v) => {
        fromValueUpdated(v);
      }}
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

  const details = [];
  const beanOutput = MaxBN(fromTokenValue, new BigNumber(0));

  if (fromTokenValue.isEqualTo(props.fundsRemaining)) {
    details.push(
      `Sow the remaining ${displayBN(beanOutput)} ${TokenLabel(
        props.asset
      )} with ${weather.toFixed()}% Weather`
    );
  } else {
    details.push(
      `Sow ${displayBN(beanOutput)} ${TokenLabel(
        props.asset
      )} with ${weather.toFixed()}% Weather`
    );
  }

  details.push(
    `Receive ${displayBN(toPodValue)} Pods at #${displayBN(
      totalPods
    )} in the Pod line`
  );

  const noSoilTextField = soil.isEqualTo(0) ? (
    <Box style={{ marginTop: '-2px', fontFamily: 'Futura-PT-Book' }}>
      Currently No Soil
    </Box>
  ) : null;
  const noFundsTextField = props.fundsRemaining.isEqualTo(0) ? (
    <Box style={{ marginTop: '-2px', fontFamily: 'Futura-PT-Book' }}>
      {`There is no more ${TokenLabel(props.asset)} to sow for the audit`}
    </Box>
  ) : null;
  function transactionDetails() {
    if (toPodValue.isLessThanOrEqualTo(0)) return;

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
      const transactionNumber = latestTransactionNumber + 1;
      dispatch(
        addTransaction({
          transactionNumber,
          description: `funding ${toStringBaseUnitBN(
            fromTokenValue,
            USDC.decimals
          )} beans`,
          state: State.PENDING,
        })
      );

      fund(
        props.id,
        toStringBaseUnitBN(fromTokenValue, USDC.decimals),
        () => {
          fromValueUpdated(new BigNumber(-1));
        },
        () => {
          dispatch(completeTransaction(transactionNumber));
        }
      );
    },
  }));

  return (
    <>
      {fromTokenField}
      {noSoilTextField}
      {noFundsTextField}
      {transactionDetails()}
    </>
  );
});
