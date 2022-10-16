import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  Divider,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import ChangeHistoryOutlinedIcon from '@mui/icons-material/ChangeHistoryOutlined';
import AnimatedPopover from '~/components/Common/AnimatedPopover';
import Row from '~/components/Common/Row';
import { BEAN, PODS, SEEDS, SPROUTS, STALK } from '~/constants/tokens';
import { AppState } from '~/state';
import { NEW_BN, ZERO_BN } from '~/constants';
import BalanceStat from './BalanceStat';
import useAccount from '~/hooks/ledger/useAccount';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import PodsBalance from './Tokens/PodsBalance';
import SproutsBalance from './Tokens/SproutsBalance';
import StalkAndSeedsBalance from './Tokens/StalkAndSeedsBalance';
import { displayFullBN } from '~/util';
import useGetChainToken from '~/hooks/chain/useGetChainToken';

const textFieldSx = {
  background: 'white',
  borderRadius: '10px',
  fontSize: '1rem !important',
  '& .MuiInputBase-root': {
    maxHeight: '40px',
    fontSize: '1rem',
  },
  '& .MuiFormControl-root': {
    borderRadius: '10px',
  },
};

const AdjustBalancesInput: React.FC<{
  amount: string | undefined;
  setAmount: React.Dispatch<React.SetStateAction<string | undefined>>;
  active: boolean;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ active, amount, setActive, setAmount }) => {
  const totalBeanSupply: BigNumber = useSelector<
    AppState,
    AppState['_bean']['token']['supply']
  >((state) => state._bean.token.supply);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value ? new BigNumber(e.target.value) : undefined;
    setAmount(newValue?.toString() || '');
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement | MouseEvent>) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') {
      e.preventDefault();
      return;
    }
    active && setAmount(undefined);
    setActive(!active);
  };

  return (
    <Card
      sx={{
        background: BeanstalkPalette.lightYellow,
        cursor: 'pointer',
        width: '100%',
        border: 'none',
        py: 1.5,
        px: 2,
      }}
      onClick={handleClick}
    >
      <Stack spacing={1} alignItems="center" width="100%">
        <ChangeHistoryOutlinedIcon
          color="primary"
          sx={{
            transform: `rotate(${active ? '180deg' : 0})`,
            height: '20px',
            width: '20px',
          }}
        />
        {!active ? (
          <Typography textAlign="center" color="primary">
            How might my balances change if Beanstalk grows next season?
          </Typography>
        ) : (
          <Stack spacing={1} width="100%">
            <Typography textAlign="center" color="primary">
              If Beanstalk minted
            </Typography>
            <TextField
              type="text"
              value={amount}
              onChange={handleChange}
              placeholder="0"
              sx={textFieldSx}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography fontWeight={450} color="black">
                      Beans
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />
            <Typography
              textAlign="center"
              color="primary"
              sx={{ whiteSpace: 'no-wrap' }}
            >
              next Season, a total Supply of{' '}
              <strong>
                {`${
                  totalBeanSupply !== NEW_BN
                    ? displayFullBN(totalBeanSupply.plus(amount || ZERO_BN), 2)
                    : '0'
                }`}
              </strong>
            </Typography>
          </Stack>
        )}
      </Stack>
    </Card>
  );
};

const FlexDivider = () => (
  <>
    <Box display={{ xs: 'none', md: 'block' }}>
      <Divider
        orientation="vertical"
        sx={{
          color: BeanstalkPalette.lightYellow,
          height: '45px',
          alignSelf: 'flex-end',
          marginBottom: '5px',
        }}
      />
    </Box>
    <Box width="100%" display={{ xs: 'block', md: 'none' }}>
      <Divider
        orientation="horizontal"
        sx={{
          color: BeanstalkPalette.lightYellow,
          width: '100%',
          height: '1px',
          my: 2,
        }}
      />
    </Box>
  </>
);

const BeanstalkTokenBalances: React.FC<{}> = () => {
  // state
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>(
    (state) => state._farmer.silo
  );
  const beanstalkSilo = useSelector<AppState, AppState['_beanstalk']['silo']>(
    (state) => state._beanstalk.silo
  );
  const beanstalkBarn = useSelector<AppState, AppState['_beanstalk']['barn']>(
    (state) => state._beanstalk.barn
  );
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>(
    (state) => state._farmer.field
  );
  const farmerBarn = useSelector<AppState, AppState['_farmer']['barn']>(
    (state) => state._farmer.barn
  );
  const account = useAccount();

  const [mintAmount, setMintAmount] = useState<string | undefined>(undefined);
  const [active, setActive] = useState(false);

  // helpers
  const getChainToken = useGetChainToken();
  const bean = getChainToken(BEAN);

  const stalkOwnership =
    farmerSilo.stalk?.active.gt(0) && beanstalkSilo.stalk.total?.gt(0)
      ? farmerSilo.stalk.active.div(beanstalkSilo.stalk.total)
      : ZERO_BN;

  const sproutsOwnership =
    farmerBarn.unfertilizedSprouts?.gt(0) && beanstalkBarn.unfertilized?.gt(0)
      ? farmerBarn.unfertilizedSprouts.div(beanstalkBarn.unfertilized)
      : ZERO_BN;

  const estimates = useMemo(() => {
    const mintedBeans = mintAmount ? new BigNumber(mintAmount) : ZERO_BN;
    const allocation = mintedBeans.div(
      beanstalkBarn?.unfertilized?.gt(0) ? 3 : 2
    );

    const seigniorage = allocation.times(stalkOwnership);

    const rinsable = sproutsOwnership.gt(0)
      ? allocation.times(sproutsOwnership)
      : undefined;
    const placeInLine = Object.values(farmerField.plots).length
      ? allocation.times(-1)
      : undefined;
    const plantableSeeds = seigniorage.times(bean.rewards?.stalk ?? ZERO_BN);
    const grownStalk = farmerSilo.seeds.active.div(10_000);

    return {
      stalk: [
        { delta: seigniorage, name: 'Earned Beans, Stalk' },
        { delta: plantableSeeds, name: 'Plantable Seeds' },
      ],
      seeds: [{ delta: grownStalk, name: 'Grown Stalk' }],
      pods: [{ delta: placeInLine, name: 'Place In Line', descending: true }],
      sprouts: [{ delta: rinsable, name: 'Rinsable Sprouts' }],
    };
  }, [
    bean.rewards?.stalk,
    beanstalkBarn?.unfertilized,
    farmerField.plots,
    farmerSilo.seeds.active,
    mintAmount,
    sproutsOwnership,
    stalkOwnership,
  ]);

  // helpers
  const canPerformActions = account !== undefined;

  return (
    <Row width="100%" justifyContent="space-between" gap={2}>
      <Stack width="100%" alignSelf="flex-start" gap={2}>
        <Typography variant="h4">Beanstalk Balances</Typography>
        {/* Stalk and Seeds */}
        <Grid container>
          <Grid item xs={12} md={5.5}>
            <AnimatedPopover
              id="stalkAndSeeds"
              popperEl={<StalkAndSeedsBalance />}
              disabled={!canPerformActions}
              scale={1.02}
            >
              <Grid container spacing={2}>
                {/* Stalk */}
                <Grid item xs={6}>
                  <BalanceStat
                    title="Stalk"
                    token={STALK}
                    amount={farmerSilo.stalk.total ?? ZERO_BN}
                    amountModifier={
                      stalkOwnership?.gt(0)
                        ? `~${displayFullBN(stalkOwnership.times(100), 4)}%`
                        : undefined
                    }
                    modifierProps={{
                      sx: { color: BeanstalkPalette.grey },
                    }}
                    estimates={active ? estimates.stalk : undefined}
                  />
                </Grid>
                {/* Seeds */}
                <Grid item xs={6}>
                  <BalanceStat
                    title="Seeds"
                    token={SEEDS}
                    amount={farmerSilo.seeds.total ?? ZERO_BN}
                    estimates={active ? estimates.seeds : undefined}
                  />
                </Grid>
              </Grid>
            </AnimatedPopover>
          </Grid>
          <FlexDivider />
          {/* pods */}
          {/* width of 6.4 to take into account width of divider */}
          <Grid item xs={12} md={6.4}>
            <Grid container spacing={2}>
              <Grid item width="100%" xs={6}>
                <AnimatedPopover
                  id="pods"
                  popperEl={<PodsBalance />}
                  disabled={account === undefined}
                >
                  <Stack alignItems={{ xs: 'flex-start', md: 'center' }}>
                    <Box>
                      <BalanceStat
                        title="Pods"
                        token={PODS}
                        amount={farmerField.pods ?? ZERO_BN}
                        amountModifier={
                          farmerField.harvestablePods?.gt(0)
                            ? `+${displayFullBN(
                                farmerField.harvestablePods,
                                PODS.displayDecimals
                              )}`
                            : undefined
                        }
                        estimates={active ? estimates.pods : undefined}
                        alignItems="flex-start"
                      />
                    </Box>
                  </Stack>
                </AnimatedPopover>
              </Grid>
              {/* sprouts */}
              <Grid item width="100%" xs={6}>
                <AnimatedPopover
                  id="sprouts"
                  popperEl={<SproutsBalance />}
                  disabled={account === undefined}
                  // alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                  <Stack alignItems={{ xs: 'flex-start', md: 'center' }}>
                    <BalanceStat
                      title="Sprouts"
                      token={SPROUTS}
                      amount={farmerField.pods ?? ZERO_BN}
                      amountModifier={
                        farmerBarn.fertilizedSprouts?.gt(0)
                          ? `+${displayFullBN(
                              farmerBarn.fertilizedSprouts,
                              SPROUTS.displayDecimals
                            )}`
                          : undefined
                      }
                      estimates={active ? estimates.sprouts : undefined}
                      alignItems="flex-start"
                    />
                  </Stack>
                </AnimatedPopover>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Stack>
      <Stack
        display={{ xs: 'none', lg: 'flex' }}
        maxWidth={{ xs: '100%', lg: '340px' }}
        width="100%"
      >
        <AdjustBalancesInput
          active={active}
          setActive={setActive}
          amount={mintAmount}
          setAmount={setMintAmount}
        />
      </Stack>
    </Row>
  );
};

export default BeanstalkTokenBalances;
