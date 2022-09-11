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
import { BEANSTALK_ADDRESSES, ONE_BN, ZERO_BN } from '~/constants';
import useAPY from '~/hooks/beanstalk/useAPY';
import EducationDepositImage from '~/img/beanstalk/education/educationDepositImg.svg';
import EducationEarnImage from '~/img/beanstalk/education/educationEarnImg.svg';
import EducationRewardsImage from '~/img/beanstalk/education/educationOwnershipImg.svg';
import DepositedAsset from '../Analytics/Silo/DepositedAsset';
import Carousel from '../Common/Carousel';
import PoolEducationContent, {
  PoolEducationContentProps,
} from './PoolEducationContent';
import { AppState } from '~/state';
import useSiloTokenToFiat from '~/hooks/beanstalk/useSiloTokenToFiat';
import { displayFullBN } from '~/util';

const depositedAssetMap = {
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

const getOptions = (tokenName: string): PoolEducationContentProps[] => [
  {
    title: `Deposit ${tokenName}`,
    texts: [
      `Use the form to Deposit ${tokenName} into the Silo.`,
      'Beanstalk allows you to use BEAN, ETH, USDC, 3CRV, DAI, USDC, USDT from your wallet or farm balance and will swap, add liquidity, and deposit for you in one transaction. ',
    ],
    imageSrc: EducationDepositImage,
  },
  {
    title: 'Receive Stalk and Seeds for your Deposit',
    texts: [
      'Stalk entitles holders to participate in Beanstalk governance and earn a portion of Bean mints.',
      'Seed grows into 1/10000 new Stalk every Season.',
    ],
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

const usePctOfTotalSiloValueWithToken = (token: ERC20Token) => {
  const balances = useSelector<
    AppState,
    AppState['_beanstalk']['silo']['balances']
  >((state) => state._beanstalk.silo.balances);
  const unripeTokens = useSelector<AppState, AppState['_bean']['unripe']>(
    (state) => state._bean.unripe
  );
  const siloTokenToFiat = useSiloTokenToFiat();

  return useMemo(() => {
    const isUnripe = (address: string) =>
      address === UNRIPE_BEAN[1].address ||
      address === UNRIPE_BEAN_CRV3[1].address;
    const getDepositedAmount = (address: string) => {
      if (isUnripe(address)) {
        const deposited = balances[address]?.deposited.amount ?? ZERO_BN;
        const depositSupply = unripeTokens[address]?.supply ?? ONE_BN;
        const pctUnderlyingDeposited = deposited.div(depositSupply);
        const underlyingAmount = unripeTokens[address]?.underlying ?? ZERO_BN;
        return pctUnderlyingDeposited.times(underlyingAmount);
      }
      return balances[address]?.deposited.amount;
    };

    const currTokenFiatValue = siloTokenToFiat(
      token,
      getDepositedAmount(token.address),
      'usd',
      !isUnripe(token.address)
    );
    const aggSiloFiatValue = Object.values(depositedAssetMap)
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
};

const useApysWithToken = (token: ERC20Token) => {
  const { data: latestYield } = useAPY();

  return useMemo(() => {
    const seeds = token.getSeeds();
    return latestYield
      ? seeds.eq(2)
        ? latestYield.bySeeds['2']
        : seeds.eq(4)
        ? latestYield.bySeeds['4']
        : null
      : null;
  }, [token, latestYield]);
};

const PoolOverviewCard: React.FC<{
  token: ERC20Token;
}> = ({ token }) => {
  const apys = useApysWithToken(token);
  const pctValue = usePctOfTotalSiloValueWithToken(token);

  return (
    <Card sx={{ p: 2, width: '100%' }}>
      <Stack gap={2}>
        {/* Title */}
        <Stack direction="row" justifyContent="space-between" gap={2}>
          <Typography variant="h4">{token.name} Overview</Typography>
          <Typography
            sx={{
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              ':hover': {
                color: BeanstalkPalette.logoGreen,
              },
            }}
          >
            View liquidity
            <CallMadeIcon sx={{ fontSize: FontSize.xs, ml: '5px' }} />
          </Typography>
        </Stack>

        {/* Stats */}
        <Stack direction="row" justifyContent="space-between" gap={2}>
          <Stat
            gap={0}
            title="Variable APY"
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
                        <TokenIcon token={STALK} style={{ marginTop: '1px' }} />
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
        {/* Token Graph */}
        <Card sx={{ borderColor: BeanstalkPalette.blue, pt: 2 }}>
          <DepositedAsset
            asset={depositedAssetMap[token.address].asset}
            account={depositedAssetMap[token.address].account}
            height={230}
          />
        </Card>
        {/* Card Carousel */}
        <Stack>
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
              elements={getOptions(token.name).map((props, i) => (
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
