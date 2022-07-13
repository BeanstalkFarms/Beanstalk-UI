import React, { useState, useEffect, useCallback } from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  Typography,
  useMediaQuery,
  Divider,
  Box,
  Link,
  CircularProgress
} from '@mui/material';
import unripeBeanIcon from 'img/tokens/unripe-bean-logo-circled.svg';
import brownLPIcon from 'img/tokens/unripe-lp-logo-circled.svg';
import { useTheme } from '@mui/material/styles';
import { useAccount, useSigner } from 'wagmi';
import { BEAN, BEAN_CRV3_LP, BEAN_ETH_UNIV2_LP, BEAN_LUSD_LP, UNRIPE_BEAN, UNRIPE_BEAN_CRV3 } from 'constants/tokens';
import { BeanstalkPalette } from 'components/App/muiTheme';
import { UNRIPE_ASSET_TOOLTIPS } from 'constants/tooltips';
import { getAccount } from 'util/Account';
import { SupportedChainId, ZERO_BN } from 'constants/index';
import Token from 'classes/Token';
import useFarmerSiloBreakdown from 'hooks/useFarmerSiloBreakdown';
import { StyledDialogActions, StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import { displayFullBN, displayUSD, toTokenUnitsBN } from 'util/index';
import useChainId from 'hooks/useChain';
import pickImage from 'img/pick.png';
import UnripeTokenRow from './UnripeTokenRow';
import DescriptionButton from 'components/Common/DescriptionButton';
import { PickMerkleResponse } from 'functions/pick/pick';
import { LoadingButton } from '@mui/lab';
import { useBeanstalkContract } from 'hooks/useContract';
import { BeanstalkReplanted } from 'generated';
import useGetChainToken from 'hooks/useGetChainToken';
import { FarmFromMode, FarmToMode } from 'lib/Beanstalk/Farm';
import TransactionToast from 'components/Common/TxnToast';

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
  // 'farmable',
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
  const breakdown = useFarmerSiloBreakdown();
  const chainId = useChainId();
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  const getChainToken = useGetChainToken();
  
  //
  const [unripe, setUnripe] = useState<GetUnripeResponse | null>(null);
  const [merkles, setMerkles] = useState<PickMerkleResponse | null>(null);
  const [pickStatus, setPickStatus] = useState<null | 'picking' | 'success' | 'error'>(null);

  useEffect(() => {
    (async () => {
      if (account?.address && open) {
        const [
          _unripe,
          _merkles
        ] = await Promise.all([
          fetch(`/.netlify/functions/unripe?account=${getAccount(account.address.toLowerCase())}`).then((response) => response.json()),
          fetch(`/.netlify/functions/pick?account=${getAccount(account.address.toLowerCase())}`).then((response) => response.json())
        ]);

        setUnripe(_unripe);
        setMerkles(_merkles);
      }
    })();
  }, [account, open]);

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
    if (pickStatus !== 'picking') setPickStatus(null);
  };

  ///
  const handlePick = useCallback((deposit : boolean) => () => {
    if (!merkles) return;

    setPickStatus('picking');
    const data = [];
    const uBean     = getChainToken(UNRIPE_BEAN);
    const uBeanCRV3 = getChainToken(UNRIPE_BEAN_CRV3);

    if (merkles.bean) {
      data.push(beanstalk.interface.encodeFunctionData("pick", [
        uBean.address,
        merkles.bean.amount,
        merkles.bean.proof,
        deposit ? FarmToMode.INTERNAL : FarmToMode.EXTERNAL,
      ]));
      if (deposit) {
        data.push(beanstalk.interface.encodeFunctionData("deposit", [
          uBean.address,
          merkles.bean.amount,
          FarmFromMode.INTERNAL, // always use internal for deposits
        ]));
      }
    }
    if (merkles.bean3crv) {
      data.push(beanstalk.interface.encodeFunctionData("pick", [
        uBeanCRV3.address,
        merkles.bean3crv.amount,
        merkles.bean3crv.proof,
        deposit ? FarmToMode.INTERNAL : FarmToMode.EXTERNAL,
      ]));
      if (deposit) {
        data.push(beanstalk.interface.encodeFunctionData("deposit", [
          uBeanCRV3.address,
          merkles.bean3crv.amount,
          FarmFromMode.INTERNAL, // always use internal for deposits
        ]));
      }
    }

    const txToast = new TransactionToast({
      loading: `Picking${deposit ? ` and depositing` : ''} Unripe Assets`,
      success: `Pick${deposit ? ` and deposit` : ''} successful. You can find your Unripe Assets ${deposit ? `in the Silo` : `in your wallet`}.`,
    });

    beanstalk.farm(data)
      .then((txn) => {
        txToast.confirming(txn);
        return txn.wait();
      })
      .then((receipt) => {
        txToast.success(receipt);
        setPickStatus('success');
      })
      .catch((err) => {
        console.error(
          txToast.error(err.error || err)
        );
        setPickStatus('error');
      });
  }, [
    merkles,
    beanstalk,
    getChainToken,
  ])

  /// Tab: Pick Overview
  let buttonText = "Nothing to Pick";
  let buttonDisabled = true;
  const buttonLoading = !merkles;
  if (merkles && (merkles.bean || merkles.bean3crv)) {
    buttonDisabled = false;
    const avail = [];
    if (merkles.bean) avail.push(`Unripe Beans`);
    if (merkles.bean3crv) avail.push(`Unripe BEAN:3CRV LP`);
    buttonText = `Pick ${avail.join(' & ')}`;
  }

  const tab0 = (
    <>
      <StyledDialogTitle sx={{ pb: 1 }} onClose={handleDialogClose}>
        Pick non-Deposited Unripe Beans and Unripe LP
      </StyledDialogTitle>
      <Stack direction="row" alignItems="center" gap={1} pb={2} pl={1} pr={3}>
        <img src={pickImage} alt="pick" style={{ height: 120 }} />
        <Typography sx={{ fontSize: '15px' }} color="text.secondary">
          To claim non-Deposited Unripe Beans and Unripe LP, they must be Picked. After Replant, you can Pick assets to your wallet, or Pick and Deposit them directly in the Silo.<br /><br />
          Unripe Deposited assets <b>do not need to be Picked</b> and will be automatically Deposited at Replant.<br /><br />
          Unripe assets represent a pro rata share of underlying assets. You can read more about them <Link href="https://bean.money/blog/a-farmers-guide-to-the-barn-raise" target="_blank" rel="noreferrer">here</Link>.
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
              <Typography>Deposited Assets</Typography>
              <Typography>{displayUSD(breakdown.states.deposited.value)}</Typography>
            </Stack>
            <Typography sx={{ fontSize: '13px' }} color="text.secondary">
              These assets do not need to be Picked and will be automatically Deposited in their Unripe state at Replant. Head to the Silo page to view your balances.
            </Typography>
          </Stack>
          <Stack gap={0.25}>
            <Stack direction="row" justifyContent="space-between">
              <Typography>Earned Beans</Typography>
              <Typography>{displayFullBN(tokenOrZero(unripe?.farmableBeans, BEAN[1]))}</Typography>
            </Stack>
            <Typography sx={{ fontSize: '13px' }} color="text.secondary">
              These assets do not need to be Picked and will be automatically Deposited as Unripe Beans upon Replant.
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
                  name={key === 'harvestable' ? 'Harvestable Pods' : `${key} Beans`}
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
                  {displayFullBN(
                    // HOTFIX:
                    // After launching this dialog, the team decided to
                    // auto-deposit Farmable Beans. Instead of reworking the
                    // underlying JSONs, we just subtract farmableBeans from 
                    // the total unripeBeans for user display.
                    tokenOrZero(unripe?.unripeBeans, BEAN[1]).minus(
                      tokenOrZero(unripe?.farmableBeans, BEAN[1])
                    )
                  )}
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
                  bdv={tokenOrZero(unripe?.[`circulating${obj.key}Bdv`], BEAN[1])}
                />
                <UnripeTokenRow
                  name={`Withdrawn ${obj.token.name}`}
                  amount={tokenOrZero(unripe?.[`withdrawn${obj.key}Lp`], obj.token)}
                  tooltip={UNRIPE_ASSET_TOOLTIPS[`withdrawn${obj.key}Lp`]}
                  token={obj.token}
                  bdv={tokenOrZero(unripe?.[`withdrawn${obj.key}Bdv`], BEAN[1])}
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
                  {displayFullBN(tokenOrZero(unripe?.unripeLp, BEAN[1]))}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </StyledDialogContent>
      <StyledDialogActions>
        <Box width="100%">
          <LoadingButton
            loading={buttonLoading}
            disabled={chainId === SupportedChainId.MAINNET || buttonDisabled}
            onClick={handleNextTab}
            fullWidth
            // Below two params are required for the disabled
            // state to work correctly and for the font to show
            // as white when enabled
            variant="contained"
            color="dark"
            sx={{
              py: 1,
              backgroundColor: BeanstalkPalette.brown,
              '&:hover': { 
                backgroundColor: BeanstalkPalette.brown,
                opacity: 0.96
              }
            }}>
            {buttonText}
          </LoadingButton>
        </Box>
      </StyledDialogActions>
    </>
  );

  /// Tab: Pick
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
          {/* <code style={{ fontSize: 12, lineHeight: '14px' }}>
            <pre>{JSON.stringify(merkles, null, 2)}</pre>
          </code> */}
          {pickStatus === null ? (
            <>
              <DescriptionButton
                title="Pick Unripe Assets" 
                description="Claim your Unripe Beans and Unripe LP to your wallet." 
                onClick={handlePick(false)}
              />
              <DescriptionButton
                title="Pick and Deposit Unripe Assets" 
                description="Claim your Unripe Beans and Unripe LP, then Deposit them in the Silo to earn yield."
                onClick={handlePick(true)}
              />
            </>
          ) : (
            <Stack direction="column" sx={{ width: '100%', minHeight: 100 }} justifyContent="center" gap={1} alignItems="center">
              {pickStatus === 'picking' && <CircularProgress variant="indeterminate" color="primary" size={32} />}
              {pickStatus === 'error' && (
                <Typography color="text.secondary">Something went wrong while picking your Unripe assets.</Typography>
              )}
              {pickStatus === 'success' && (
                <Typography color="text.secondary">Unripe Assets picked successfully.</Typography>
              )}
            </Stack>
          )}
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
