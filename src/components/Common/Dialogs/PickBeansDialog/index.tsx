import React, { useState, useEffect, useMemo } from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  Typography,
  Button,
  Box,
  useMediaQuery,
  Divider
} from '@mui/material';
import unripeBeanIcon from 'img/tokens/unripe-bean-logo-circled.svg';
import brownLPIcon from 'img/tokens/unripe-lp-logo-circled.svg';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useTheme } from '@mui/material/styles';
import { useAccount } from 'wagmi';
import { BEAN, BEAN_CRV3_LP, BEAN_ETH_UNIV2_LP, BEAN_LUSD_LP } from 'constants/tokens';
import BigNumber from 'bignumber.js';
import { BeanstalkPalette } from 'components/App/muiTheme';
import { UNRIPE_ASSETS } from 'constants/tooltips';
import { StyledDialogContent, StyledDialogTitle } from '../../Dialog';
import { displayBN, toTokenUnitsBN } from '../../../../util';
import TokenStateRow from './TokenStateRow';
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
  'unripeLP'
  );
type GetUnripeResponse = Partial<{ [key in UnripeKeys]: string }>;

// ----------------------------------------------------

const UNRIPE_BEAN_CATEGORIES = [
  'circulatingBeans',
  'withdrawnBeans',
  'harvestableBeans',
  'orderedBeans',
  'farmableBeans',
  'wrappedBeans',
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

// ----------------------------------------------------

const PickBeansDialog: React.FC<{
  handleClose: any;
} & DialogProps> =
  ({
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

    useEffect(() => {
      if (account?.address) {
        fetch(`/.netlify/functions/unripe?account=${account.address.toLowerCase()}`)
          .then((response) => response.json())
          .then((json) => {
            setUnripe(json);
          })
          .catch((e) => {
            console.error(e);
          });
      }
    }, [account, unripe]);

    const unripeBeanData = useMemo(() => {
      if (unripe !== null) {
        return (
          UNRIPE_BEAN_CATEGORIES.map((key, i) => (
            {
              key: key,
              // title case
              state: key.split('Beans')[0].charAt(0).toUpperCase() + key.split('Beans')[0].slice(1),
              amount: unripe[key] !== undefined
                ? toTokenUnitsBN(unripe[key] as string, BEAN[1].decimals)
                : new BigNumber(0)
            }
          ))
        );
      }
    }, [unripe]);

    const unripeLPData = useMemo(() => {
      if (unripe !== null) {
        return (
          UNRIPE_LP_CATEGORIES.map((obj, i) => (
            {
              key: `circulating${obj.key}Lp`,
              token: obj.token,
              circulating: unripe[`circulating${obj.key}Lp`] !== undefined
                ? toTokenUnitsBN(unripe[`circulating${obj.key}Lp`] as string, obj?.token?.decimals)
                : new BigNumber(0),
              withdrawn: unripe[`withdrawn${obj.key}Lp`] !== undefined
                ? toTokenUnitsBN(unripe[`withdrawn${obj.key}Lp`] as string, obj?.token?.decimals)
                : new BigNumber(0),
              circulatingBdv: unripe[`circulating${obj.key}Bdv`] !== undefined
                ? toTokenUnitsBN(unripe[`circulating${obj.key}Bdv`] as string, obj?.token?.decimals)
                : new BigNumber(0),
              withdrawnBdv: unripe[`withdrawn${obj.key}Bdv`] !== undefined
                ? toTokenUnitsBN(unripe[`withdrawn${obj.key}Bdv`] as string, obj?.token?.decimals)
                : new BigNumber(0),
            }
          ))
        );
      }
    }, [unripe]);

    const totalUnripeBeans = useMemo(() => {
      if (unripe !== null) {
        return (
          unripe.unripeBeans !== undefined
            ? toTokenUnitsBN(unripe.unripeBeans as string, BEAN[1].decimals)
            : new BigNumber(0)
        );
      }
    }, [unripe]);

    const totalUnripeLP = useMemo(() => {
      if (unripe !== null) {
        return (
          unripe.unripeLP !== undefined
            ? toTokenUnitsBN(unripe.unripeLP as string, 18)
            : new BigNumber(0)
        );
      }
    }, [unripe]);

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
        <StyledDialogTitle sx={{ pb: 0.5 }} onClose={handleDialogClose}>Pick Unripe Beans</StyledDialogTitle>
        <StyledDialogContent>
          <Stack gap={1.3}>
            <Typography sx={{ fontSize: '15px' }} color="text.secondary">
              Your Unripe Beans & LP available to Pick are assets which were not Deposited pre-exploit. Upon Unpause,
              Beanstalk will automatically deposit your pre-exploit Deposited balance.
            </Typography>
            <Stack sx={{ pl: isMobile ? 0 : 2, pb: 0.5 }} gap={0.5}>
              <Stack gap={0.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '16px' }}>Deposited Balance</Typography>
                  <Typography sx={{ fontSize: '16px' }}>$XX</Typography>
                </Stack>
                <Typography sx={{ fontSize: '12px' }} color="text.secondary">
                  Your Deposited Balance will automatically be deposited upon Replant, these beans do not need to be
                  picked!
                </Typography>
              </Stack>
              <Divider />
              <Stack gap={0.9}>
                <Typography variant="h3">Pre-exploit LP Balances Available to Pick</Typography>
                {
                  (unripeLPData !== undefined) ? (
                    unripeLPData.map((obj, i) => (
                      <>
                        <Typography sx={{ fontSize: '16px' }}>{obj?.token?.name} Balances</Typography>
                        <TokenStateRow
                          name={`Circulating ${obj?.token?.name}`}
                          amount={obj?.circulating}
                          tooltip={UNRIPE_ASSETS[obj.key]}
                          token={obj?.token}
                          bdv={obj?.circulatingBdv}
                        />
                        <TokenStateRow
                          name={`Withdrawn ${obj?.token?.name}`}
                          amount={obj?.circulating}
                          tooltip={UNRIPE_ASSETS[obj?.key]}
                          token={obj?.token}
                          bdv={obj?.circulatingBdv}
                        />
                      </>
                    ))
                  ) : null
                }
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Stack direction="row" alignItems="center" gap={0.3}>
                  <Typography sx={{ fontSize: '16px' }}>
                    Total Unripe LP Available to Pick
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={0.3}>
                  <img src={brownLPIcon} alt="Circulating Beans" width={13} />
                  {totalUnripeLP !== undefined && <Typography variant="h3">{displayBN(totalUnripeLP)}</Typography>}
                </Stack>
              </Stack>
            </Stack>
            <Stack sx={{ pl: isMobile ? 0 : 2 }} gap={0.5}>
              <Stack gap={0.9}>
                <Typography variant="h3">Pre-exploit Bean Balances Available to Pick</Typography>
                {
                  (unripeBeanData !== undefined) ? (
                    unripeBeanData.map((obj, i) => (
                      // exclude 'token' attribute to show Bean state
                      <TokenStateRow
                        name={`${obj?.state} Beans`}
                        amount={obj?.amount}
                        tooltip={UNRIPE_ASSETS[obj?.key]}
                        bdv={obj?.amount}
                      />
                    ))
                  ) : null
                }
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Stack direction="row" alignItems="center" gap={0.3}>
                  <Typography sx={{ fontSize: '16px' }}>
                    Total Unripe Beans Available to Pick
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={0.3}>
                  <img src={unripeBeanIcon} alt="Circulating Beans" width={13} />
                  {totalUnripeBeans !== undefined &&
                  <Typography variant="h3">{displayBN(totalUnripeBeans)}</Typography>}
                </Stack>
              </Stack>
            </Stack>
            <Button
              onClick={handleNextTab}
              sx={{
                py: 1,
                backgroundColor: BeanstalkPalette.brown,
                '&:hover': {
                  backgroundColor: BeanstalkPalette.brown,
                  opacity: 0.98
                }
              }}>
              Pick Unripe Assets
            </Button>
          </Stack>
        </StyledDialogContent>
      </>
    );

    const tab1 = (
      <>
        <StyledDialogTitle
          sx={{ pb: 0.5 }}
          onClose={handleDialogClose}
        >
          <Box sx={{ cursor: 'pointer' }} onClick={handlePreviousTab}>
            <ChevronLeftIcon />
          </Box>
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
