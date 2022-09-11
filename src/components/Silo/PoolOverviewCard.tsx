import CallMadeIcon from '@mui/icons-material/CallMade';
import { Card, Chip, Stack, Typography } from '@mui/material';
import React from 'react';
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

import { BEANSTALK_ADDRESSES } from '~/constants';
import useAPY from '~/hooks/beanstalk/useAPY';
import EducationDepositImage from '~/img/beanstalk/education/educationDepositImg.svg';
import EducationEarnImage from '~/img/beanstalk/education/educationEarnImg.svg';
import EducationRewardsImage from '~/img/beanstalk/education/educationOwnershipImg.svg';
import DepositedAsset from '../Analytics/Silo/DepositedAsset';
import Carousel from '../Common/Carousel';
import PoolEducationContent, {
  PoolEducationContentProps,
} from './PoolEducationContent';

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

const PoolOverviewCard: React.FC<{
  token: ERC20Token;
}> = ({ token }) => {
  const apyQuery = useAPY();

  console.log(apyQuery.data);

  const asset = depositedAssetMap[token.address];

  const renderVariableApyAmount = () => (
    <Stack direction="row" gap={0.5}>
      <Typography color="primary" variant="h2">
        ~5.67%
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
  );

  return (
    <Card sx={{ p: 2, width: '100%' }}>
      <Stack gap={2}>
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
        <Stack direction="row" justifyContent="space-between">
          <Stat
            gap={0}
            title="Variable APY"
            amount={renderVariableApyAmount()}
          />
          <Stat
            gap={0}
            title="% of total value Deposited in Silo"
            amount="27.52%"
            variant="bodyLarge"
            sx={{ alignSelf: 'flex-end' }}
          />
        </Stack>
        <Card sx={{ borderColor: BeanstalkPalette.blue, pt: 2 }}>
          <DepositedAsset
            asset={asset.asset}
            account={asset.account}
            height={230}
          />
        </Card>
        <Stack>
          <Card sx={{ borderColor: BeanstalkPalette.blue }}>
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
