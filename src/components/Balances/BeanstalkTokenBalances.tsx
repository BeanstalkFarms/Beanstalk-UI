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
import { PODS, SEEDS, SPROUTS, STALK } from '~/constants/tokens';
import { AppState } from '~/state';
import { NEW_BN, ZERO_BN } from '~/constants';
import BalanceStat, { BalanceStatProps } from './BalanceStat';
import { Module, ModuleContent } from '~/components/Common/Module';
import useAccount from '~/hooks/ledger/useAccount';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import PodsBalance from './Tokens/PodsBalance';
import SproutsBalance from './Tokens/SproutsBalance';
import StalkAndSeedsBalance from './Tokens/StalkAndSeedsBalance';
import { displayFullBN } from '~/util';

const valueOrZeroBN = (value?: BigNumber, returnUndef?: boolean) => {
  const returnVal = returnUndef ? undefined : ZERO_BN;
  return value?.gt(0) ? value : returnVal;
};

const textFieldSx = {
  background: 'white',
  fontSize: '1rem !important',
  '& .MuiInputBase-root': {
    maxHeight: '40px',
    fontSize: '1rem',
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

  const handleClick = () => {
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
    >
      <Stack spacing={1} alignItems="center">
        <ChangeHistoryOutlinedIcon
          onClick={handleClick}
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
          <Stack spacing={1}>
            <Typography textAlign="center" color="primary">
              If Beanstalk minted
            </Typography>
            <TextField
              type="text"
              value={amount}
              onChange={handleChange}
              placeholder="0"
              sx={textFieldSx}
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
              sx={{ whiteSpace: 'nowrap' }}
            >
              next Season, a total Supply of{' '}
              <strong>
                {`${
                  totalBeanSupply !== NEW_BN
                    ? displayFullBN(totalBeanSupply, 2)
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

const ResponsiveDivider = () => (
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

  const stalkOwnership =
    farmerSilo.stalk?.active.gt(0) && beanstalkSilo.stalk.total?.gt(0)
      ? farmerSilo.stalk.active.div(beanstalkSilo.stalk.total)
      : ZERO_BN;

  const estimates = useMemo(() => {
    const beansMinted = mintAmount ? new BigNumber(mintAmount) : ZERO_BN;
    const mintsDivisor = beanstalkBarn.unfertilized?.gt(0)
      ? new BigNumber(3)
      : new BigNumber(2);
    const allocatedBeans = beansMinted.div(mintsDivisor);

    const beanSeigniorage = allocatedBeans.times(stalkOwnership);
    const plantableSeeds = beanSeigniorage.times(2);
    // grown stalk
    const earnedStalk = farmerSilo.seeds.active.div(10_000);
    // rinsable sprouts
    const unfertilizedOwnership =
      farmerBarn.unfertilizedSprouts?.gt(0) && beanstalkBarn.unfertilized?.gt(0)
        ? farmerBarn.unfertilizedSprouts.div(beanstalkBarn.unfertilized)
        : ZERO_BN;

    const rinsable = allocatedBeans.times(unfertilizedOwnership);
    const placeInLine = Object.values(farmerField.plots).length
      ? allocatedBeans.times(-1)
      : undefined;

    return {
      beanSeigniorage,
      earnedStalk,
      plantableSeeds,
      placeInLine,
      rinsable,
    };
  }, [
    beanstalkBarn.unfertilized,
    farmerBarn.unfertilizedSprouts,
    farmerSilo.seeds.active,
    farmerField.plots,
    stalkOwnership,
    mintAmount,
  ]);

  const datasss = useMemo(() => {
    const stk = farmerSilo.stalk;
    const activeStalks = stk.active.toNumber();
    const a = stk.earned.toNumber();
    const b = stk.grown.toNumber();
    const c = stk.total.toNumber();
    console.log('-------------');
    console.log('active: ', activeStalks);
    console.log('earned: ', a);
    console.log('grown: ', b);
    console.log('total: ', c);
    console.log('-------------');
  }, [farmerSilo.stalk]);

  // helpers
  const canPerformActions = account !== undefined;

  // options
  const stalkAndSeedsOption: BalanceStatProps[] = [
    {
      title: 'Stalk',
      token: STALK,
      amount: valueOrZeroBN(farmerSilo.stalk.total),
      amountModifier: undefined,
      estimates: active
        ? [
            { delta: estimates.beanSeigniorage, name: 'Earned Beans, Stalk' },
            { delta: estimates.plantableSeeds, name: 'Plantable Seeds' },
          ]
        : undefined,
    },
    {
      title: 'Seeds',
      token: SEEDS,
      amount: valueOrZeroBN(farmerSilo.seeds.total),
      amountModifier: undefined,
      estimates: active
        ? [{ delta: estimates.earnedStalk, name: 'Earned Stalk' }]
        : undefined,
    },
  ];

  const podsAndSproutsOptions: BalanceStatProps[] = [
    {
      title: 'Pods',
      token: PODS,
      amount: valueOrZeroBN(farmerField.pods),
      amountModifier: valueOrZeroBN(farmerField.harvestablePods, true),
      estimates: active
        ? [{ delta: estimates.placeInLine, name: 'Place In Line' }]
        : undefined,
    },
    {
      title: 'Sprouts',
      token: SPROUTS,
      amount: valueOrZeroBN(farmerBarn.unfertilizedSprouts),
      amountModifier: valueOrZeroBN(farmerBarn.fertilizedSprouts, true),
      estimates: active
        ? [{ delta: estimates.rinsable, name: 'Rinsable Sprouts' }]
        : undefined,
    },
  ];

  return (
    <Module sx={{ boxSizing: 'border-box' }}>
      <ModuleContent px={2} py={2}>
        <Row width="100%" justifyContent="space-between" gap={2}>
          <Stack width="100%" alignSelf="flex-start" gap={1}>
            <Typography variant="h4" sx={{ pb: 0.5 }}>
              Beanstalk Balances
            </Typography>
            {/* stalk and seeds */}
            <Grid container>
              <Grid item xs={12} md={5.5}>
                <AnimatedPopover
                  id="stalkAndSeeds"
                  popperEl={<StalkAndSeedsBalance />}
                  disabled={!canPerformActions}
                  scale={1.02}
                >
                  <Grid container spacing={2}>
                    {stalkAndSeedsOption.map((item) => (
                      <Grid
                        item
                        key={item.title}
                        maxWidth="100%"
                        width="100%"
                        xs={6}
                      >
                        <BalanceStat {...item} />
                      </Grid>
                    ))}
                  </Grid>
                </AnimatedPopover>
              </Grid>
              <ResponsiveDivider />
              {/* pods and sprouts */}
              {/* width of 6.4 to take into account width of divider */}
              <Grid item xs={12} md={6.4}>
                <Grid container spacing={2}>
                  {podsAndSproutsOptions.map((opt, k) => (
                    <Grid item maxWidth="100%" width="100%" key={k} xs={6}>
                      <Stack alignItems={{ xs: 'flex-start', md: 'center' }}>
                        <AnimatedPopover
                          popperEl={
                            opt.token === PODS ? (
                              <PodsBalance />
                            ) : (
                              <SproutsBalance />
                            )
                          }
                          disabled={!canPerformActions}
                          id={`${opt.title}-popper`}
                        >
                          <BalanceStat
                            alignItems={{ xs: 'flex-start', md: 'center' }}
                            {...opt}
                          />
                        </AnimatedPopover>
                      </Stack>
                    </Grid>
                  ))}
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
      </ModuleContent>
    </Module>
  );
};

export default BeanstalkTokenBalances;
