import React, { useMemo } from 'react';

import CallMadeIcon from '@mui/icons-material/CallMade';
import { Card, Chip, Stack, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

import { ERC20Token } from '~/classes/Token';
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
import EducationDepositImage from '~/img/beanstalk/education/educationDepositImg.svg';
import EducationEarnImage from '~/img/beanstalk/education/educationEarnImg.svg';
import EducationRewardsImage from '~/img/beanstalk/education/educationOwnershipImg.svg';
import PoolEducationContent, {
  PoolEducationContentProps,
} from './PoolEducationContent';
import { AppState } from '~/state';
import useSiloTokenToFiat from '~/hooks/beanstalk/useSiloTokenToFiat';
import { displayFullBN } from '~/util';
import DepositedAsset from '../Analytics/Silo/DepositedAsset';
import Carousel from '../Common/Carousel';

const whitelisted = {
  bean: BEAN[1].address,
  bean3crv: BEAN_CRV3_LP[1].address,
  unripeBean: UNRIPE_BEAN[1].address,
  unripe3crv: UNRIPE_BEAN_CRV3[1].address,
};

const assetInfoMap = {
  [whitelisted.bean]: {
    asset: BEAN[1],
    account: BEANSTALK_ADDRESSES[1],
  },
  [whitelisted.bean3crv]: {
    asset: BEAN_CRV3_LP[1],
    account: BEANSTALK_ADDRESSES[1],
  },
  [whitelisted.unripeBean]: {
    asset: UNRIPE_BEAN[1],
    account: BEANSTALK_ADDRESSES[1],
  },
  [whitelisted.unripe3crv]: {
    asset: UNRIPE_BEAN_CRV3[1],
    account: BEANSTALK_ADDRESSES[1],
  },
};

const cardTextsByToken = {
  [whitelisted.bean]: [
    'Use the form to Deposit BEAN into the Silo.',
    'Beanstalk allows you to use BEAN, ETH, USDC, 3CRV, DAI, USDC, USDT from your wallet or Farm balance to Deposit Bean into the Silo. If you aren&#39;t using Bean, the UI will swap and Deposit for you in one transaction.',
  ],
  [whitelisted.bean3crv]: [
    'Use the form to Deposit BEAN3CRV into the Silo.',
    'Beanstalk allows you to use BEAN, ETH, USDC, 3CRV, DAI, USDC, USDT from your wallet or Farm balance to Deposit BEAN3CRV into the Silo. If you aren&#39;t using BEAN3CRV, the UI will swap, add liquidity, and Deposit the LP token for you in one transaction.',
  ],
  [whitelisted.unripeBean]: [
    'Deposit urBEAN Use the form to Deposit urBEAN into the Silo.',
    'Beanstalk allows you to use urBEAN from your wallet or Farm balance to Deposit urBEAN into the Silo.',
  ],
  [whitelisted.unripe3crv]: [
    'Use the form to Deposit urBEAN3CRV into the Silo.',
    'Beanstalk allows you to use urBEAN3CRV from your wallet or Farm balance to Deposit urBEAN3CRV into the Silo.',
  ],
};

const getCardContentWithToken = (
  token: ERC20Token
): PoolEducationContentProps[] => [
  {
    title: `Deposit ${token.name}`,
    texts: [
      `Use the form to Deposit ${token.name} into the Silo.`,
      'Beanstalk allows you to use BEAN, ETH, USDC, 3CRV, DAI, USDC, USDT from your wallet or farm balance and will swap, add liquidity, and deposit for you in one transaction. ',
    ],
    imageSrc: EducationDepositImage,
  },
  {
    title: 'Receive Stalk and Seeds for your Deposit',
    texts: [...cardTextsByToken[token.address]],
    imageSrc: EducationRewardsImage,
  },
  {
    title: 'Earn Beans',
    texts: [
      'Every Season that Beans are minted, receive a share of the new Beans based on your percentage ownership of Stalk.',
      'Your Earned Beans are automatically deposited for Earned Stalk and Seeds.',
    ],
    imageSrc: EducationEarnImage,
  },
];

const PoolOverviewCard: React.FC<{
  token: ERC20Token;
}> = ({ token }) => {
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

  // determine if token is ripe and is LP
  const isRipeAndLP = poolStates[token.address];

  return (
    <Card sx={{ p: 2, boxSizing: 'border-box', height: '100%' }}>
      <Stack gap={2}>
        {/* Title */}
        <Stack direction="row" justifyContent="space-between" gap={2}>
          <Typography variant="h4">{token.name} Overview</Typography>
          {isRipeAndLP ? (
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
        </Stack>

        {/* Token Graph */}
        <Card sx={{ borderColor: BeanstalkPalette.blue, pt: 2 }}>
          <DepositedAsset
            asset={assetInfoMap[token.address].asset}
            account={assetInfoMap[token.address].account}
            height={230}
          />
        </Card>

        {/* Stats */}
        <Stack direction="row" justifyContent="space-between" gap={2}>
          <Stat
            gap={0}
            title="Deposit Rewards"
            amount={
              <Stack direction="row" gap={0.5}>
                <Typography color="primary" variant="h2">
                  {apys ? `${apys.bean.times(100).toFixed(1)}%` : '0.00%'}
                </Typography>
                <Chip
                  sx={{ borderRadius: '16px', height: '28px' }}
                  label={
                    <>
                      <Typography display="inline" variant="h4">
                        <TokenIcon
                          token={STALK}
                          style={{ marginTop: '4px', height: '0.8rem' }}
                        />
                        {token.rewards?.stalk}
                      </Typography>{' '}
                      <Typography display="inline" variant="h4">
                        <TokenIcon token={SEEDS} style={{ marginTop: '2px' }} />
                        {token.rewards?.seeds}
                      </Typography>
                    </>
                  }
                />
              </Stack>
            }
          />
          <Stack textAlign="right">
            <Stat
              gap={0}
              title="% of total value Deposited in Silo"
              amount={`${displayFullBN(pctValue, 2, 2)}%`}
              variant="bodyLarge"
              sx={{ alignSelf: 'flex-end' }}
            />
          </Stack>
        </Stack>

        {/* Card Carousel */}
        <Stack gap={1}>
          <Typography variant="h4">How the Silo works</Typography>
          <Card
            // heights are defined here otherwise layout jumps occur during animation
            sx={({ breakpoints }) => ({
              borderColor: BeanstalkPalette.blue,
              overflow: 'hidden',
              [breakpoints.up('md')]: { height: '250px' },
              [breakpoints.between('sm', 'md')]: { height: '425px' },
              [breakpoints.down('sm')]: { height: '475px' },
            })}
          >
            <Carousel
              elements={getCardContentWithToken(token).map((props, i) => (
                <PoolEducationContent key={i} {...props} />
              ))}
              paginationSx={{
                position: 'absolute',
                bottom: '15px',
                right: '20px',
              }}
            />
          </Card>
        </Stack>
      </Stack>
    </Card>
  );
};

export default PoolOverviewCard;
