import React, { useMemo } from 'react';

import CallMadeIcon from '@mui/icons-material/CallMade';
import { Card, Chip, Stack, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

import {
  BEAN,
  BEAN_CRV3_LP,
  SEEDS,
  STALK,
  UNRIPE_BEAN,
  UNRIPE_BEAN_CRV3,
} from '~/constants/tokens';
import { BeanstalkPalette, FontSize } from '../App/muiTheme';
import Stat from '../Common/Stat';
import TokenIcon from '../Common/TokenIcon';
import { BEANSTALK_ADDRESSES, CURVE_LINK, ONE_BN, ZERO_BN } from '~/constants';
import useAPY from '~/hooks/beanstalk/useAPY';
import { AppState } from '~/state';
import useSiloTokenToFiat from '~/hooks/beanstalk/useSiloTokenToFiat';
import { displayFullBN } from '~/util';
import DepositedAsset from '../Analytics/Silo/DepositedAsset';

import SiloCarousel from './SiloCarousel';
import { ERC20Token } from '~/classes/Token';
import Row from '~/components/Common/Row';

const assetInfoMap = {
  [BEAN[1].address]: {
    asset: BEAN[1],
    account: BEANSTALK_ADDRESSES[1],
  },
  [BEAN_CRV3_LP[1].address]: {
    asset: BEAN_CRV3_LP[1],
    account: BEANSTALK_ADDRESSES[1],
  },
  [UNRIPE_BEAN[1].address]: {
    asset: UNRIPE_BEAN[1],
    account: BEANSTALK_ADDRESSES[1],
  },
  [UNRIPE_BEAN_CRV3[1].address]: {
    asset: UNRIPE_BEAN_CRV3[1],
    account: BEANSTALK_ADDRESSES[1],
  },
};

const SiloAssetOverviewCard: React.FC<{ token: ERC20Token }> = ({ token }) => {
  const balances = useSelector<
    AppState,
    AppState['_beanstalk']['silo']['balances']
  >((state) => state._beanstalk.silo.balances);
  const unripeTokens = useSelector<AppState, AppState['_bean']['unripe']>(
    (state) => state._bean.unripe
  );
  const poolStates = useSelector<AppState, AppState['_bean']['pools']>(
    (state) => state._bean.pools
  );
  const { data: latestYield } = useAPY();
  const siloTokenToFiat = useSiloTokenToFiat();

  // determine if token is ripe and is LP
  const isRipeAndIsLP = poolStates[token.address];

  // get pct value of all silo tokens
  const pctValue = useMemo(() => {
    const isUnripe = (address: string) =>
      address === UNRIPE_BEAN[1].address ||
      address === UNRIPE_BEAN_CRV3[1].address;
    const getDepositedAmount = (address: string) => {
      if (isUnripe(address)) {
        const deposited = balances[address]?.deposited.amount ?? ZERO_BN;
        const depositSupply = unripeTokens[address]?.supply ?? ONE_BN;
        return deposited
          .div(depositSupply)
          .times(unripeTokens[address]?.underlying ?? ZERO_BN);
      }
      return balances[address]?.deposited.amount;
    };

    const currTokenFiatValue = siloTokenToFiat(
      token,
      getDepositedAmount(token.address),
      'usd',
      !isUnripe(token.address)
    );
    const aggSiloFiatValue = Object.values(assetInfoMap)
      .map(({ asset }) =>
        siloTokenToFiat(
          asset,
          getDepositedAmount(asset.address),
          'usd',
          !isUnripe(asset.address)
        )
      )
      .reduce((prev, curr) => prev.plus(curr), ZERO_BN);

    return currTokenFiatValue.div(aggSiloFiatValue).times(100);
  }, [balances, siloTokenToFiat, token, unripeTokens]);

  // apy
  const seeds = token.getSeeds();
  const apys = latestYield
    ? seeds.eq(2)
      ? latestYield.bySeeds['2']
      : seeds.eq(4)
      ? latestYield.bySeeds['4']
      : null
    : null;

  const DepositRewards = () => (
    <Row gap={1} justifyContent="center">
      <Row gap={0.5} justifyContent="center">
        <Typography variant="bodyLarge">
          <TokenIcon
            token={STALK}
            style={{ marginTop: '7px', height: '0.7em' }}
          />
          {token.rewards?.stalk}
        </Typography>
        <Typography variant="bodyLarge">
          <TokenIcon
            token={SEEDS}
            style={{ marginTop: '4px', fontSize: 'inherit' }}
          />
          {token.rewards?.seeds}
        </Typography>
      </Row>
      <Chip
        variant="filled"
        color="primary"
        onClick={undefined}
        label={
          <Typography>
            {`vAPY ~${apys ? `${apys.bean.times(100).toFixed(1)}%` : '0.00%'}`}
          </Typography>
        }
        size="small"
        sx={{ alignSelf: 'center' }}
      />
    </Row>
  );

  return (
    <Card sx={{ p: 2, boxSizing: 'border-box', height: '100%' }}>
      <Stack gap={2}>
        {/* Title */}
        <Row gap={2} justifyContent="space-between">
          <Typography variant="h4">{token.name} Overview</Typography>
          {isRipeAndIsLP ? (
            <Typography
              sx={{
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                ':hover': {
                  color: BeanstalkPalette.logoGreen,
                },
              }}
              onClick={() => {
                // FIXME: change link when more pools are added
                window.open(CURVE_LINK, '_blank', 'noopener');
              }}
            >
              View liquidity
              <CallMadeIcon sx={{ fontSize: FontSize.xs, ml: '5px' }} />
            </Typography>
          ) : null}
        </Row>

        {/* Token Graph */}
        <Card sx={{ borderColor: BeanstalkPalette.blue, pt: 2 }}>
          <DepositedAsset
            asset={assetInfoMap[token.address].asset}
            account={assetInfoMap[token.address].account}
            height={230}
          />
        </Card>

        {/* Stats */}
        <Row gap={2} justifyContent="space-between">
          <Stat gap={0} title="Deposit Rewards" amount={<DepositRewards />} />
          <Stack textAlign="right">
            <Stat
              gap={0}
              title="% of total value Deposited in Silo"
              amount={`${displayFullBN(pctValue, 2, 2)}%`}
              variant="bodyLarge"
              sx={{ alignSelf: 'flex-end' }}
            />
          </Stack>
        </Row>

        {/* Card Carousel */}
        <Stack gap={1}>
          <Typography variant="h4">How the Silo works</Typography>
          <SiloCarousel token={token} />
        </Stack>
      </Stack>
    </Card>
  );
};

export default SiloAssetOverviewCard;
