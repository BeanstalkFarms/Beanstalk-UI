import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import {
  ExpandMore as ExpandMoreIcon,
  Box,
} from '@material-ui/icons/ExpandMore';
import {
  SEEDS,
  STALK,
  LPBEANS_TO_SEEDS,
  UNI_V2_ETH_BEAN_LP,
} from '../../constants';
import {
  claimAndWithdrawLP,
  MinBN,
  MinBNs,
  toStringBaseUnitBN,
  TrimBN,
  withdrawLP,
} from '../../util';
import {
  SettingsFormModule,
  SiloAsset,
  TokenInputField,
  TokenOutputField,
  TransitAsset,
} from '../Common';

export const LPWithdrawSubModule = forwardRef((props, ref) => {
  const [fromStalkValue, setFromStalkValue] = useState(new BigNumber(-1));
  const [fromSeedsValue, setFromSeedsValue] = useState(new BigNumber(-1));
  const [fromLPValue, setFromLPValue] = useState(new BigNumber(-1));
  const [withdrawParams, setWithdrawParams] = useState({
    crates: [],
    amounts: [],
  });

  /* function maxLPs(stalk: BugNumber) {
    var stalkRemoved = new BigNumber(0)
    var beans = new BigNumber(0)
    Object.keys(props.crates).sort((a,b) => parseInt(a) - parseInt(b)).forEach(key => {
      let stalkPerLP = (new BigNumber(10000)).plus(props.season.minus(key)).multipliedBy(5)
      const stalkLeft = stalk.minus(stalkRemoved)
      if (stalkPerLP.multipliedBy(props.crates[key]).isGreaterThanOrEqualTo(stalkLeft)) {
        stalkRemoved = stalkRemoved.plus(stalkPerLP.multipliedBy(props.crates[key]))
        beans = beans.plus(props.crates[key])
        if (stalkRemoved.isEqualTo(stalk)) return
      } else {
        beans = beans.plus(TrimBN(stalkLeft.dividedBy(stalkPerLP),18))
        return
      }
    })
    return beans
  }
  */

  function fromValueUpdated(newFromNumber) {
    const fromNumber = MinBN(newFromNumber, props.maxFromLPVal);
    const newFromLPValue = TrimBN(fromNumber, UNI_V2_ETH_BEAN_LP.decimals);
    setFromLPValue(newFromLPValue);
    const [stalkRemoved, seedsRemoved] = getStalkAndSeedsRemoved(fromNumber);
    setFromStalkValue(TrimBN(stalkRemoved, STALK.decimals));
    setFromSeedsValue(TrimBN(seedsRemoved, SEEDS.decimals));
    props.setIsFormDisabled(newFromLPValue.isLessThanOrEqualTo(0));
  }

  const getStalkAndSeedsRemoved = beans => {
    let lpRemoved = new BigNumber(0);
    let stalkRemoved = new BigNumber(0);
    let seedsRemoved = new BigNumber(0);
    const crates = [];
    const amounts = [];
    BigNumber.set({ DECIMAL_PLACES: 6 });
    Object.keys(props.crates)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .some(key => {
        const crateLPsRemoved = lpRemoved
          .plus(props.crates[key])
          .isLessThanOrEqualTo(beans)
          ? props.crates[key]
          : beans.minus(lpRemoved);
        const crateSeedsRemoved = props.seedCrates[key]
          .multipliedBy(crateLPsRemoved)
          .dividedBy(props.crates[key]);
        lpRemoved = lpRemoved.plus(crateLPsRemoved);
        seedsRemoved = seedsRemoved.plus(crateSeedsRemoved);
        BigNumber.set({ DECIMAL_PLACES: 10 });
        stalkRemoved = stalkRemoved.plus(
          crateSeedsRemoved.dividedBy(LPBEANS_TO_SEEDS),
        );
        stalkRemoved = stalkRemoved.plus(
          crateSeedsRemoved
            .multipliedBy(props.season.minus(key))
            .multipliedBy(0.00001),
        );
        BigNumber.set({ DECIMAL_PLACES: 6 });
        crates.push(key);
        amounts.push(
          toStringBaseUnitBN(crateLPsRemoved, UNI_V2_ETH_BEAN_LP.decimals),
        );
        return lpRemoved.isEqualTo(beans);
      });
    BigNumber.set({ DECIMAL_PLACES: 18 });
    setWithdrawParams({ crates, amounts });
    return [stalkRemoved, seedsRemoved];
  };

  const handleFromChange = event => {
    if (event.target.value) {
      fromValueUpdated(new BigNumber(event.target.value));
    } else {
      fromValueUpdated(new BigNumber(-1));
    }
  };
  const maxHandler = () => {
    const minMaxFromVal = MinBNs([
      props.maxFromStalkVal.multipliedBy(props.stalkToLP),
      props.maxFromSeedsVal.multipliedBy(props.seedsToLP),
      props.maxFromLPVal,
    ]);
    fromValueUpdated(minMaxFromVal);
  };

  /* Input Fields */

  const fromLPField = (
    <TokenInputField
      balance={props.maxFromLPVal}
      handleChange={handleFromChange}
      isLP
      maxHandler={maxHandler}
      poolForLPRatio={props.poolForLPRatio}
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
      value={fromStalkValue}
    />
  );
  const toBurnSeedsField = (
    <TokenOutputField
      burn
      decimals={4}
      token={SiloAsset.Seed}
      value={fromSeedsValue}
    />
  );
  const toTransitLPField = (
    <TokenOutputField mint token={TransitAsset.LP} value={fromLPValue} />
  );

  /* Transaction Details, settings and text */

  const unvoteTextField = props.locked ? (
    <Box style={{ marginTop: '-5px', fontFamily: 'Futura-PT-Book' }}>
      Unvote Active BIPs to Withdraw
    </Box>
  ) : null;
  const showSettings = props.hasClaimable ? (
    <SettingsFormModule
      hasClaimable={props.hasClaimable}
      showUnitModule={false}
      setSettings={props.setSettings}
      settings={props.settings}
    />
  ) : null;
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
        <Box style={{ display: 'inline-block', width: '100%' }}>
          <span>
            {`You will lose ${fromStalkValue
              .dividedBy(props.totalStalk)
              .multipliedBy(100)
              .toFixed(3)}% ownership of Beanstalk.`}
          </span>
          <br />
          <span style={{ color: 'red' }}>
            WARNING: Your Withdrawal will be frozen for 24 full Seasons.
          </span>
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
      )
        return;

      if (props.settings.claim) {
        claimAndWithdrawLP(
          withdrawParams.crates,
          withdrawParams.amounts,
          props.claimable,
          () => {
            fromValueUpdated(new BigNumber(-1));
          },
        );
      } else {
        withdrawLP(withdrawParams.crates, withdrawParams.amounts, () => {
          fromValueUpdated(new BigNumber(-1));
        });
      }
    },
  }));

  return (
    <>
      {fromLPField}
      {unvoteTextField}
      {transactionDetails()}
      {showSettings}
    </>
  );
});
