import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import {
  LPBEANS_TO_SEEDS,
  STALK,
  SEEDS,
  UNI_V2_ETH_BEAN_LP,
} from 'constants/index';
import {
  displayBN,
  MinBN,
  toStringBaseUnitBN,
  TrimBN,
  smallDecimalPercent,
} from 'util/index';
import {
  CryptoAsset,
  InputFieldPlus,
  SiloAsset,
  siloStrings,
  TokenOutputField,
  TransactionDetailsModule,
} from 'components/Common';

export const WithdrawModule = forwardRef(({
  setIsFormDisabled,
}, ref) => {
  const [fromCurveLPValue, setFromCurveLPValue] = useState(new BigNumber(-1));
  const [toSeedValue, setToSeedValue] = useState(new BigNumber(0));
  const [toStalkValue, setToStalkValue] = useState(new BigNumber(0));
  const [withdrawParams, setWithdrawParams] = useState({
    crates: [],
    amounts: [],
  });

  // const tokenBalances = useSelector<AppState, AppState['tokenBalances']>(
  //   (state) => state.tokenBalances
  // );
  const { totalStalk, withdrawSeasons } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  const season = useSelector<AppState, AppState['season']>(
    (state) => state.season.season
  );
  const {
    lpDeposits,
    lpBalance,
    lpSeedDeposits,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const getStalkAndSeedsRemoved = (beans) => {
    let lpRemoved = new BigNumber(0);
    let stalkRemoved = new BigNumber(0);
    let seedsRemoved = new BigNumber(0);
    const crates = [];
    const amounts = [];
    BigNumber.set({ DECIMAL_PLACES: 6 });
    Object.keys(lpDeposits)
      .sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
      .some((key) => {
        const crateLPsRemoved = lpRemoved
          .plus(lpDeposits[key])
          .isLessThanOrEqualTo(beans)
          ? lpDeposits[key]
          : beans.minus(lpRemoved);
        const crateSeedsRemoved = lpSeedDeposits[key]
          .multipliedBy(crateLPsRemoved)
          .dividedBy(lpDeposits[key]);
        lpRemoved = lpRemoved.plus(crateLPsRemoved);
        seedsRemoved = seedsRemoved.plus(crateSeedsRemoved);
        BigNumber.set({ DECIMAL_PLACES: 10 });
        stalkRemoved = stalkRemoved.plus(
          crateSeedsRemoved.dividedBy(LPBEANS_TO_SEEDS)
        );
        stalkRemoved = stalkRemoved.plus(
          crateSeedsRemoved
            .multipliedBy(season.minus(key))
            .multipliedBy(0.00001)
        );
        BigNumber.set({ DECIMAL_PLACES: 6 });
        crates.push(key);
        amounts.push(
          toStringBaseUnitBN(crateLPsRemoved, UNI_V2_ETH_BEAN_LP.decimals)
        );
        return lpRemoved.isEqualTo(beans);
      });
    BigNumber.set({ DECIMAL_PLACES: 18 });
    setWithdrawParams({ crates, amounts });
    return [stalkRemoved, seedsRemoved];
  };

  function fromValueUpdated(newFromNumber) {
    const fromNumber = MinBN(newFromNumber, lpBalance); /* tokenBalances.BEAN is used as max curve lp Balance */
    const newFromLPValue = TrimBN(fromNumber, UNI_V2_ETH_BEAN_LP.decimals);
    setFromCurveLPValue(newFromLPValue);
    const [stalkRemoved, seedsRemoved] = getStalkAndSeedsRemoved(fromNumber);
    setToStalkValue(TrimBN(stalkRemoved, STALK.decimals));
    setToSeedValue(TrimBN(seedsRemoved, SEEDS.decimals));
    setIsFormDisabled(newFromLPValue.isLessThanOrEqualTo(0));
  }

  const handleFromChange = (event) => {
    if (event.target.value) {
      fromValueUpdated(new BigNumber(event.target.value));
    } else {
      fromValueUpdated(new BigNumber(-1));
    }
  };

  /* Input Fields */
  const fromCurveLPField = (
    <InputFieldPlus
      key={1}
      balance={lpBalance}
      handleChange={handleFromChange}
      locked={lpBalance.isLessThanOrEqualTo(0)}
      token={CryptoAsset.Crv3}
      value={TrimBN(fromCurveLPValue, 9)}
    />
  );

  /* Output Fields */
  const toCurveLPField = (
    <TokenOutputField
      burn
      token={CryptoAsset.Crv3}
      value={fromCurveLPValue}
    />
  );
  const toBurnStalkField = (
    <TokenOutputField
      burn
      decimals={4}
      token={SiloAsset.Stalk}
      value={toStalkValue}
    />
  );
  const toBurnSeedsField = (
    <TokenOutputField
      burn
      decimals={4}
      token={SiloAsset.Seed}
      value={toSeedValue}
    />
  );

  /* Transaction Details, settings and text */
  const details = [
    `Withdraw ${displayBN(new BigNumber(fromCurveLPValue))} BEAN:3CRV LP Tokens from the Silo`,
    `Burn ${displayBN(new BigNumber(toStalkValue))} Stalk and ${displayBN(
      new BigNumber(toSeedValue)
    )} Seeds`
  ];

  const stalkChangePercent = toStalkValue
    .dividedBy(totalStalk)
    .multipliedBy(100);

  function transactionDetails() {
    if (fromCurveLPValue.isLessThanOrEqualTo(0)) return null;

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        <Box style={{ display: 'inline-flex' }}>
          <Box style={{ marginRight: '5px' }}>{toBurnStalkField}</Box>
          <Box style={{ marginLeft: '5px' }}>{toBurnSeedsField}</Box>
        </Box>
        <Box style={{ display: 'inline-block', width: '100%' }}>
          {toCurveLPField}
        </Box>
        <TransactionDetailsModule fields={details} />
        <Box
          style={{
            display: 'inline-block',
            width: '100%',
            fontSize: 'calc(9px + 0.5vmin)',
          }}
        >
          <span>
            {`You will forfeit ${smallDecimalPercent(
              stalkChangePercent
            )}% ownership of Beanstalk.`}
          </span>
          <br />
          <span style={{ color: 'red', fontSize: 'calc(9px + 0.5vmin)' }}>
            {siloStrings.withdrawWarning.replace('{0}', withdrawSeasons)}
          </span>
        </Box>
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (
        fromCurveLPValue.isLessThanOrEqualTo(0) ||
        withdrawParams.crates.length === 0 ||
        withdrawParams.amounts.length === 0
      ) {
        return null;
      }
    },
  }));

  return (
    <>
      {fromCurveLPField}
      {transactionDetails()}
    </>
  );
});
