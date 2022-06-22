import React, { useState, useEffect, useMemo } from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  Typography,
  Button,
  useMediaQuery,
  Divider
} from '@mui/material';
import unripeBeanIcon from 'img/tokens/unripe-bean-logo-circled.svg';
import brownLPIcon from 'img/tokens/unripe-lp-logo-circled.svg';
import { useTheme } from '@mui/material/styles';
import { useAccount } from 'wagmi';
import { BEAN, BEAN_CRV3_LP, BEAN_ETH_UNIV2_LP, BEAN_LUSD_LP } from 'constants/tokens';
import { BeanstalkPalette } from 'components/App/muiTheme';
import { UNRIPE_ASSET_TOOLTIPS } from 'constants/tooltips';
import { getAccount } from 'util/Account';
import { ZERO_BN } from 'constants/index';
import Token from 'classes/Token';
import useFarmerSiloBreakdown from 'hooks/useFarmerSiloBreakdown';
import { StyledDialogActions, StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import { displayBN, displayUSD, toTokenUnitsBN } from 'util/index';
import UnripeTokenRow from './UnripeTokenRow';
import SelectorCard from './SelectorCard';

// ----------------------------------------------------

type UnripeKeys = (
  // Beans
  'circulatingBeans' |
  'withdrawnBeans' |
  'harvestableBeans' |
  'orderedBeans' |
  'farmableBeans' |
  'wrappedBeans' |
  'unripeBeans' |
  // LP
  'circulatingBeanEthLp' |
  'circulatingBeanLusdLp' |
  'circulatingBean3CrvLp' |
  'withdrawnBeanEthLp' |
  'withdrawnBeanLusdLp' |
  'withdrawnBean3CrvLp' |
  'circulatingBeanEthBdv' |
  'circulatingBeanLusdBdv' |
  'circulatingBean3CrvBdv' |
  'withdrawnBeanEthBdv' |
  'withdrawnBeanLusdBdv' |
  'withdrawnBean3CrvBdv' |
  'unripeLp'
  );
type GetUnripeResponse = Partial<{ [key in UnripeKeys]: string }>;

// ----------------------------------------------------

const UNRIPE_BEAN_CATEGORIES = [
  'circulating',
  'withdrawn',
  'harvestable',
  'ordered',
  'farmable',
  'wrapped',
] as const;

const UNRIPE_LP_CATEGORIES = [
  {
    key: 'BeanEth',
    token: BEAN_ETH_UNIV2_LP[1],
  },
  {
    key: 'Bean3Crv',
    token: BEAN_CRV3_LP[1],
  },
  {
    key: 'BeanLusd',
    token: BEAN_LUSD_LP[1],
  },
] as const;

const tokenOrZero = (amount: string | undefined, token: Token) => {
  if (!amount) return ZERO_BN;
  return toTokenUnitsBN(amount, token.decimals);
};

// ----------------------------------------------------

const PickBeansDialog: React.FC<{
  handleClose: any;
} & DialogProps> = ({
  open,
  sx,
  onClose,
  fullWidth,
  fullScreen,
  disableScrollLock,
  handleClose
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tab, setTab] = useState(0);
  const { data: account } = useAccount();
  const [unripe, setUnripe] = useState<GetUnripeResponse | null>(null);
  const breakdown = useFarmerSiloBreakdown();

  useEffect(() => {
    if (account?.address) {
      fetch(`/.netlify/functions/unripe?account=${getAccount(account.address.toLowerCase())}`)
        .then((response) => response.json())
        .then((json) => {
          setUnripe(json);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [account]);

  // Handlers
  const handleDialogClose = () => {
    handleClose();
    setTab(0);
  };
  const handleNextTab = () => {
    setTab(tab + 1);
  };
  const handlePreviousTab = () => {
    setTab(tab - 1);
  };
  const handlePickBeans = () => {
    // TODO: pick assets
  };
  const handlePickAndDepositBeans = () => {
    // TODO: pick & deposit assets
  };

  const tab0 = (
    <>
      <StyledDialogTitle sx={{ pb: 0.5 }} onClose={handleDialogClose}>
        Pick Unripe Beans & LP
      </StyledDialogTitle>
      <StyledDialogContent>
        <Stack gap={1.5}>
          <Typography sx={{ fontSize: '15px' }} color="text.secondary">
            Your Unripe Beans & LP available to Pick are assets which were not Deposited pre-exploit. Upon Unpause,
            Beanstalk will automatically deposit your pre-exploit Deposited balance.
          </Typography>
          {/**
            * Section 1: Deposited Balance
            */}
          <Stack gap={0.25}>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: '16px' }}>Deposited Balance</Typography>
              <Typography sx={{ fontSize: '16px' }}>{displayUSD(breakdown.states.deposited.value)}</Typography>
            </Stack>
            <Typography sx={{ fontSize: '12px' }} color="text.secondary">
              Your Deposited Balance will automatically be deposited upon Replant, these beans do not need to be
              picked!
            </Typography>
          </Stack>
          <Divider />
          {/**
            * Section 2: LP
            */}
          <Stack sx={{ pl: isMobile ? 0 : 1, pb: 0.5 }} gap={1}>
            {/**
              * Section 2a: LP by State
              */}
            <Stack gap={1.5}>
              <Typography variant="h3">Pre-exploit LP Balances Available to Pick</Typography>
              {UNRIPE_LP_CATEGORIES.map((obj) => (
                <Stack key={obj.token.address} gap={0.5}>
                  <Typography sx={{ fontSize: '16px' }}>{obj.token.name} Balances</Typography>
                  <UnripeTokenRow
                    name={`Circulating ${obj.token.name}`}
                    amount={tokenOrZero(unripe?.[`circulating${obj.key}Lp`], obj.token)}
                    tooltip={UNRIPE_ASSET_TOOLTIPS[`circulating${obj.key}Lp`]}
                    token={obj.token}
                    bdv={tokenOrZero(unripe?.[`circulating${obj.key}Bdv`], obj.token)}
                  />
                  <UnripeTokenRow
                    name={`Withdrawn ${obj.token.name}`}
                    amount={tokenOrZero(unripe?.[`withdrawn${obj.key}Lp`], obj.token)}
                    tooltip={UNRIPE_ASSET_TOOLTIPS[`withdrawn${obj.key}Lp`]}
                    token={obj.token}
                    bdv={tokenOrZero(unripe?.[`withdrawn${obj.key}Bdv`], obj.token)}
                  />
                </Stack>
              ))}
            </Stack>
            <Divider />
            {/**
              * Section 2b: Total Unripe LP
              */}
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" alignItems="center" gap={0.3}>
                <Typography sx={{ fontSize: '16px' }}>
                  Total Unripe LP Available to Pick
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={0.3}>
                <img src={brownLPIcon} alt="Circulating Beans" width={13} />
                <Typography variant="h3">
                  {displayBN(tokenOrZero(unripe?.unripeLp, BEAN[1]))}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          {/**
            * Section 2: Unripe Beans
            */}
          <Stack sx={{ pl: isMobile ? 0 : 1 }} gap={1}>
            {/**
              * Section 2a: Beans by State
              */}
            <Stack gap={1.5}>
              <Typography variant="h3">Pre-exploit Bean Balances Available to Pick</Typography>
              <Stack gap={0.5}>
                {UNRIPE_BEAN_CATEGORIES.map((key) => (
                  <UnripeTokenRow
                    key={key}
                    name={`${key} Beans`}
                    amount={tokenOrZero(unripe?.[`${key}Beans`], BEAN[1])}
                    tooltip={UNRIPE_ASSET_TOOLTIPS[`${key}Beans`]}
                    token={BEAN[1]}
                  />
                ))}
              </Stack>
            </Stack>
            <Divider />
            {/**
              * Section 3b: Total Unripe Beans
              */}
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" alignItems="center" gap={0.3}>
                <Typography sx={{ fontSize: '16px' }}>
                  Total Unripe Beans Available to Pick
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={0.3}>
                <img src={unripeBeanIcon} alt="Circulating Beans" width={13} />
                <Typography variant="h3">
                  {displayBN(tokenOrZero(unripe?.unripeBeans, BEAN[1]))}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </StyledDialogContent>
      <StyledDialogActions>
        <Button
          onClick={handleNextTab}
          fullWidth
          sx={{
            py: 1,
            backgroundColor: BeanstalkPalette.brown,
            '&:hover': {
              backgroundColor: BeanstalkPalette.brown,
              opacity: 0.96
            }
          }}>
          Pick Unripe Assets
        </Button>
      </StyledDialogActions>
    </>
  );

  const tab1 = (
    <>
      <StyledDialogTitle
        onBack={handlePreviousTab}
        onClose={handleDialogClose}
      >
        Pick Unripe Assets
      </StyledDialogTitle>
      <StyledDialogContent sx={{ width: isMobile ? null : '560px' }}>
        <Stack gap={0.8}>
          <SelectorCard 
            title="Pick Unripe Beans" 
            description="Claim the Unripe Beans to your wallet." 
            handleClick={() => {}}
          />
          <SelectorCard 
            title="Pick Unripe Beans" 
            description="Claim your Unripe Beans & LP, then Deposit them in the Silo to earn yield."
            handleClick={() => {}}
            recommendOption
          />
        </Stack>
      </StyledDialogContent>
    </>
  );

  return (
    <Dialog
      onClose={onClose}
      open={open}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      disableScrollLock={disableScrollLock}
      sx={{ ...sx }}
    >
      {tab === 0 && tab0}
      {tab === 1 && tab1}
    </Dialog>
  );
};

export default PickBeansDialog;
