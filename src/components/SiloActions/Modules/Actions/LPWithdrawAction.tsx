import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import {
  SEEDS,
  STALK,
  LPBEANS_TO_SEEDS,
  UNI_V2_ETH_BEAN_LP,
} from 'constants/index';
import {
  claimAndWithdrawLP,
  displayBN,
  MinBN,
  MinBNs,
  smallDecimalPercent,
  toStringBaseUnitBN,
  TrimBN,
  withdrawLP,
} from 'util/index';
import {
  // ClaimTextModule,
  SettingsFormModule,
  SiloAsset,
  siloStrings,
  TokenInputField,
  TokenOutputField,
  TransitAsset,
  TransactionDetailsModule,
  TransactionToast,
} from 'components/Common';

const LPWithdrawAction = forwardRef(({
  setIsFormDisabled,
  poolForLPRatio,
  settings,
  setSettings,
  stalkToLP, /* empty */
  seedsToLP, /* empty */
}, ref) => {
  const [fromLPValue, setFromLPValue] = useState(new BigNumber(-1));
  const [toSeedsValue, setToSeedsValue] = useState(new BigNumber(0));
  const [toStalkValue, setToStalkValue] = useState(new BigNumber(0));
  const [withdrawParams, setWithdrawParams] = useState({
    crates: [],
    amounts: [],
  });

  const {
    claimable,
    hasClaimable,
    lpDeposits,
    lpSiloBalance,
    lpSeedDeposits,
    seedBalance,
    stalkBalance,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const season = useSelector<AppState, AppState['season']>(
    (state) => state.season.season
  );

  const { totalStalk, withdrawSeasons } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  /* function maxLPs(stalk: BugNumber) {
    var stalkRemoved = new BigNumber(0)
    var beans = new BigNumber(0)
    Object.keys(lpDeposits).sort((a,b) => parseInt(a) - parseInt(b)).forEach(key => {
      let stalkPerLP = (new BigNumber(10000)).plus(season.minus(key)).multipliedBy(5)
      const stalkLeft = stalk.minus(stalkRemoved)
      if (stalkPerLP.multipliedBy(lpDeposits[key]).isGreaterThanOrEqualTo(stalkLeft)) {
        stalkRemoved = stalkRemoved.plus(stalkPerLP.multipliedBy(lpDeposits[key]))
        beans = beans.plus(lpDeposits[key])
        if (stalkRemoved.isEqualTo(stalk)) return
      } else {
        beans = beans.plus(TrimBN(stalkLeft.dividedBy(stalkPerLP),18))
        return
      }
    })
    return beans
  }
  */

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
    const fromNumber = MinBN(newFromNumber, lpSiloBalance);
    const newFromLPValue = TrimBN(fromNumber, UNI_V2_ETH_BEAN_LP.decimals);
    setFromLPValue(newFromLPValue);
    const [stalkRemoved, seedsRemoved] = getStalkAndSeedsRemoved(fromNumber);
    setToStalkValue(TrimBN(stalkRemoved, STALK.decimals));
    setToSeedsValue(TrimBN(seedsRemoved, SEEDS.decimals));
    setIsFormDisabled(newFromLPValue.isLessThanOrEqualTo(0));
  }

  const handleFromChange = (event) => {
    if (event.target.value) {
      fromValueUpdated(new BigNumber(event.target.value));
    } else {
      fromValueUpdated(new BigNumber(-1));
    }
  };
  const maxHandler = () => {
    const minMaxFromVal = MinBNs([
      stalkBalance.multipliedBy(stalkToLP),
      seedBalance.multipliedBy(seedsToLP),
      lpSiloBalance,
    ]);
    fromValueUpdated(minMaxFromVal);
  };

  /* Input Fields */
  const fromLPField = (
    <TokenInputField
      balance={lpSiloBalance}
      handleChange={handleFromChange}
      isLP
      locked={lpSiloBalance.isLessThanOrEqualTo(0)}
      maxHandler={maxHandler}
      poolForLPRatio={poolForLPRatio}
      setValue={setFromLPValue}
      token={SiloAsset.LP}
      value={TrimBN(fromLPValue, 9)}
    />
  );

  /* Output Fields */
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
      value={toSeedsValue}
    />
  );
  const toTransitLPField = (
    <TokenOutputField mint token={TransitAsset.LP} value={fromLPValue} />
  );

  /* Transaction Details, settings and text */
  const details = [];
  details.push(
    `Withdraw ${displayBN(new BigNumber(fromLPValue))} BEAN:ETH LP Tokens from the Silo`
  );
  details.push(
    `Burn ${displayBN(new BigNumber(toStalkValue))} Stalk and ${displayBN(
      new BigNumber(toSeedsValue)
    )} Seeds`
  );

  const showSettings = hasClaimable ? (
    <SettingsFormModule
      hasClaimable={hasClaimable}
      showUnitModule={false}
      setSettings={setSettings}
      settings={settings}
    />
  ) : null;
  const stalkChangePercent = toStalkValue
    .dividedBy(totalStalk)
    .multipliedBy(100);

  function transactionDetails() {
    if (fromLPValue.isLessThanOrEqualTo(0)) return null;

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
          {toTransitLPField}
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
          <span style={{ color: 'red' }}>{siloStrings.withdrawWarning.replace('{0}', withdrawSeasons)}</span>
        </Box>
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (
        fromLPValue.isLessThanOrEqualTo(0) ||
        withdrawParams.crates.length === 0 ||
        withdrawParams.amounts.length === 0
      ) {
        return;
      }

      if (settings.claim) {
        // Toast
        const txToast = new TransactionToast({
          loading: `Claiming and withdrawing ${displayBN(fromLPValue)} LP Tokens`,
          success: `Claimed and withdrew ${displayBN(fromLPValue)} LP Tokens`,
        });

        // Execute
        claimAndWithdrawLP(
          withdrawParams.crates,
          withdrawParams.amounts,
          claimable,
          (response) => {
            fromValueUpdated(new BigNumber(-1));
            txToast.confirming(response);
          }
        )
        .then((value) => {
          txToast.success(value);
        })
        .catch((err) => {
          txToast.error(err);
        });
      } else {
        // Toast
        const txToast = new TransactionToast({
          loading: `Withdrawing ${displayBN(fromLPValue)} LP Tokens`,
          success: `Withdrew ${displayBN(fromLPValue)} LP Tokens`,
        });

        // Execute
        withdrawLP(
          withdrawParams.crates,
          withdrawParams.amounts,
          (response) => {
            fromValueUpdated(new BigNumber(-1));
            txToast.confirming(response);
          }
        )
        .then((value) => {
          txToast.success(value);
        })
        .catch((err) => {
          txToast.error(err);
        });
      }
    },
  }));

  return (
    <>
      {fromLPField}
      {transactionDetails()}
      {showSettings}
    </>
  );
});

export default LPWithdrawAction;
