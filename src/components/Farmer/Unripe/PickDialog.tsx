import React, { useState, useEffect, useMemo } from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  Typography,
  Button,
  useMediaQuery,
  Divider,
  Tooltip,
  Box
} from '@mui/material';
import unripeBeanIcon from 'img/tokens/unripe-bean-logo-circled.svg';
import brownLPIcon from 'img/tokens/unripe-lp-logo-circled.svg';
import { useTheme } from '@mui/material/styles';
import { useAccount } from 'wagmi';
import { BEAN, BEAN_CRV3_LP, BEAN_ETH_UNIV2_LP, BEAN_LUSD_LP } from 'constants/tokens';
import { BeanstalkPalette } from 'components/App/muiTheme';
import { UNRIPE_ASSET_TOOLTIPS } from 'constants/tooltips';
import { getAccount } from 'util/Account';
import { SupportedChainId, ZERO_BN } from 'constants/index';
import Token from 'classes/Token';
import useFarmerSiloBreakdown from 'hooks/useFarmerSiloBreakdown';
import { StyledDialogActions, StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import { displayBN, displayUSD, toTokenUnitsBN } from 'util/index';
import useChainId from 'hooks/useChain';
import pickImage from 'img/pick.png';
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
  const chainId = useChainId();

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
      <StyledDialogTitle sx={{ pb: 1 }} onClose={handleDialogClose}>
        Pick non-Deposited Unripe Beans and Unripe LP
      </StyledDialogTitle>
      <Stack direction="row" alignItems="center" gap={1} pb={2} pl={1} pr={3}>
        <img src={pickImage} alt="pick" style={{ height: 120 }} />
        <Typography sx={{ fontSize: '15px' }} color="text.secondary">
          To claim non-Deposited Unripe Beans and Unripe LP, they must be Picked. After Replant, you can Pick assets to your wallet, or Pick and Deposit them directly in the Silo.<br /><br />
          Unripe Deposited assets <b>do not need to be Picked</b> and will be automatically Deposited at Replant.
        </Typography>
      </Stack>
      <Divider />
      <StyledDialogContent>
        <Stack gap={2}>
          {/**
            * Section 1: Deposited Balance
            */}
          <Stack gap={0.25}>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: '16px' }}>Deposited Assets</Typography>
              <Typography sx={{ fontSize: '16px' }}>{displayUSD(breakdown.states.deposited.value)}</Typography>
            </Stack>
            <Typography sx={{ fontSize: '13px' }} color="text.secondary">
              These assets do not need to be Picked and will be automatically Deposited in their Unripe state at Replant. Head to the Silo page to view your balances.
            </Typography>
          </Stack>
          <Divider />
          {/**
            * Section 2: Unripe Beans
            */}
          <Stack gap={1}>
            {/**
              * Section 2a: Beans by State
              */}
            <Typography variant="h3">Non-Deposited pre-exploit Bean balances</Typography>
            <Stack gap={0.5} pl={1}>
              {UNRIPE_BEAN_CATEGORIES.map((key) => (
                <UnripeTokenRow
                  key={key}
                  name={key === 'harvestable' ? 'Harvestable Pods' : key === 'farmable' ? 'Earned Beans' : `${key} Beans`}
                  amount={tokenOrZero(unripe?.[`${key}Beans`], BEAN[1])}
                  tooltip={UNRIPE_ASSET_TOOLTIPS[`${key}Beans`]}
                  token={BEAN[1]}
                />
              ))}
            </Stack>
            <Divider sx={{ ml: 1 }} />
            {/**
              * Section 3b: Total Unripe Beans
              */}
            <Stack direction="row" justifyContent="space-between" pl={1}>
              <Typography>
                Unripe Beans that will be available to Pick at Replant
              </Typography>
              <Stack direction="row" alignItems="center" gap={0.3}>
                <img src={unripeBeanIcon} alt="Circulating Beans" width={13} />
                <Typography variant="h3">
                  {displayBN(tokenOrZero(unripe?.unripeBeans, BEAN[1]))}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          {/**
            * Section 3: LP
            */}
          <Stack sx={{ pl: isMobile ? 0 : 0, pb: 0.5 }} gap={1}>
            {/**
              * Section 2a: LP by State
              */}
            <Typography variant="h3">Non-Deposited pre-exploit LP balances</Typography>
            {UNRIPE_LP_CATEGORIES.map((obj) => (
              <Stack key={obj.token.address} gap={0.5} pl={1}>
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
            <Divider sx={{ ml: 1 }} />
            {/**
              * Section 2b: Total Unripe LP
              */}
            <Stack direction="row" justifyContent="space-between" pl={1}>
              <Typography>
                Unripe BEAN:3CRV LP that will be available to Pick at Replant
              </Typography>
              <Stack direction="row" alignItems="center" gap={0.3}>
                <img src={brownLPIcon} alt="Circulating Beans" width={13} />
                <Typography variant="h3">
                  {displayBN(tokenOrZero(unripe?.unripeLp, BEAN[1]))}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </StyledDialogContent>
      <StyledDialogActions>
        <Box width="100%">
          <Button
            disabled={chainId === SupportedChainId.MAINNET}
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
            Picking Unripe Assets will be available upon Replant
          </Button>
        </Box>
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
            title="Pick Unripe Assets" 
            description="Claim your Unripe Beans and Unripe LP to your wallet." 
            handleClick={() => {}}
          />
          <SelectorCard 
            title="Pick and Deposit Unripe Assets" 
            description="Claim your Unripe Beans and Unripe LP, then Deposit them in the Silo to earn yield."
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
