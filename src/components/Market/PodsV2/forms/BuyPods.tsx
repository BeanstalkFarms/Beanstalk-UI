import {
  Button,
  Divider,
  InputAdornment,
  MenuItem,
  Select,
  Slider,
  Stack,
  StackProps,
  TextField,
  TextFieldProps,
  Typography,
  TypographyVariant,
} from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Token, { NativeToken, ERC20Token } from '~/classes/Token';
import { FontSize } from '~/components/App/muiTheme';
import { TokenAdornment, TokenSelectDialog } from '~/components/Common/Form';
import InfoRow from '~/components/Common/Form/InfoRow';
import { TokenSelectMode } from '~/components/Common/Form/TokenSelectDialog';
import Row from '~/components/Common/Row';
import { ZERO_BN } from '~/constants';
import { BEAN, ETH, WETH } from '~/constants/tokens';
import useTokenMap from '~/hooks/chain/useTokenMap';
import useToggle from '~/hooks/display/useToggle';
import useFarmerBalances from '~/hooks/farmer/useFarmerBalances';
import usePreferredToken, {
  PreferredToken,
} from '~/hooks/farmer/usePreferredToken';
import { AppState } from '~/state';
import { displayBN, displayFullBN } from '~/util';
import {
  buyFieldsAtomAtom,
  fulfillAmountAtom,
  fulfillTokenAtom,
  placeInLineAtom,
  PodOrderType,
  podsOrderTypeAtom,
  PricingFn,
  pricingFunctionAtom,
  selectedListingAtom,
  ValueAtom,
} from '../info/atom-context';

const PlaceInLineSlider: React.FC<{
  disabled?: boolean;
  canSlide?: boolean;
}> = ({ disabled, canSlide = true }) => {
  // state
  const [index, setIndex] = useAtom(placeInLineAtom);
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );

  const fieldMaxIndex = beanstalkField?.podLine || ZERO_BN;

  return (
    <Stack>
      <Slider
        color="primary"
        aria-label="place-in-line"
        value={index.toNumber()}
        onChange={(_, v) => {
          canSlide && setIndex(new BigNumber(v as number));
        }}
        min={0}
        max={fieldMaxIndex.toNumber()}
        disabled={disabled}
        sx={{ cursor: canSlide && !disabled ? 'pointer' : 'default' }}
      />
      <Row width="100%">
        <Typography color="text.tertiary" variant="caption">
          0
        </Typography>
        <Typography width="100%" textAlign="center" variant="caption">
          Place in Line: 0 -{' '}
          <Typography component="span" color="text.tertiary" variant="caption">
            {displayBN(index)}
          </Typography>
        </Typography>
        <Typography color="text.tertiary" variant="caption">
          {displayBN(fieldMaxIndex)}
        </Typography>
      </Row>
    </Stack>
  );
};

const AtomBNInput: React.FC<
  { atom: ValueAtom } & {
    textAlign?: 'left' | 'right';
    disableInput?: boolean;
  } & TextFieldProps
> = ({
  atom: _atom, // rename to avoid conflict w/ atom import
  textAlign = 'right',
  disableInput,
  ...props
}) => {
  const [value, setValue] = useAtom(_atom);

  return (
    <TextField
      type="text"
      placeholder="0"
      value={displayFullBN(value || ZERO_BN, 2)}
      onChange={(e) => {
        if (disableInput) return;
        const v = e.target.value.split(',').join('');
        if (v === '') {
          setValue(ZERO_BN);
        } else {
          setValue(new BigNumber(v));
        }
      }}
      fullWidth
      size="small"
      {...props}
      sx={{
        '& .MuiInputBase-input': {
          textAlign: textAlign,
          fontSize: FontSize.xs,
          '&.Mui-disabled': {
            color: 'text.tertiary',
          },
        },
        ...props.sx,
      }}
    />
  );
};

const AtomOutputField: React.FC<
  {
    atom: ValueAtom;
    label?: string;
    info?: string;
    formatValue?: (...props: any | any[]) => string;
  } & StackProps
> = ({ atom: _atom, label, info, formatValue, ...stackProps }) => {
  const value = useAtomValue(_atom);

  return (
    <Stack
      direction="row"
      width="100%"
      justifyContent="space-between"
      {...stackProps}
      sx={{
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'text.primary',
        ...stackProps.sx,
      }}
    >
      <Typography variant="caption" color="text.primary">
        {label}
      </Typography>
      <Typography variant="caption" color="text.primary" textAlign="right">
        {`${
          formatValue ? formatValue(value) : displayFullBN(value || ZERO_BN, 2)
        } ${info || ''}`}
      </Typography>
    </Stack>
  );
};

const BuyOrderType: React.FC<{}> = () => {
  const [orderType, setOrderType] = useAtom(podsOrderTypeAtom);
  const isFill = orderType === PodOrderType.FILL;

  return (
    <Row>
      <Button
        variant="text"
        color="primary"
        size="small"
        sx={{
          width: '50px',
          p: '4px !important',
          backgroundColor: !isFill ? 'secondary.main' : undefined,
          ':hover': {
            backgroundColor: !isFill ? 'secondary.main' : undefined,
          },
          color: isFill ? 'text.primary' : undefined,
          borderRadius: 0.8,
        }}
        onClick={() => setOrderType(PodOrderType.ORDER)}
      >
        <Typography variant="caption">ORDER</Typography>
      </Button>
      <Button
        variant="text"
        color="primary"
        size="small"
        sx={{
          p: 0.4,
          width: '50px',
          backgroundColor: isFill ? 'secondary.main' : undefined,
          ':hover': {
            backgroundColor: isFill ? 'secondary.main' : undefined,
          },
          color: !isFill ? 'text.primary' : undefined,
          borderRadius: 0.8,
        }}
        onClick={() => setOrderType(PodOrderType.FILL)}
      >
        <Typography variant="caption">FILL</Typography>
      </Button>
    </Row>
  );
};

const BuyPricingFnSelect: React.FC<{}> = () => {
  const [pricingFn, setPricingFn] = useAtom(pricingFunctionAtom);

  return (
    <Select
      value={pricingFn}
      defaultValue={PricingFn.FIXED}
      onChange={(e) => setPricingFn(e.target.value as PricingFn)}
      size="small"
      sx={{ fontSize: FontSize.sm }}
    >
      <MenuItem value={PricingFn.FIXED} sx={{ fontSize: FontSize.sm }}>
        {PricingFn.FIXED}
      </MenuItem>
      <MenuItem value={PricingFn.DYNAMIC} sx={{ fontSize: FontSize.sm }}>
        {PricingFn.DYNAMIC}
      </MenuItem>
    </Select>
  );
};

const PREFERRED_TOKENS: PreferredToken[] = [
  {
    token: BEAN,
    minimum: new BigNumber(1), // $1
  },
  {
    token: ETH,
    minimum: new BigNumber(0.001), // ~$2-4
  },
  {
    token: WETH,
    minimum: new BigNumber(0.001), // ~$2-4
  },
];

const useSetBaseToken = () => {
  const [fulfillToken, setFulfillToken] = useAtom(fulfillTokenAtom);
  const baseToken = usePreferredToken(PREFERRED_TOKENS, 'use-best');

  useEffect(() => {
    if (baseToken && !fulfillToken) {
      setFulfillToken(baseToken);
    }
  }, [fulfillToken, baseToken, setFulfillToken]);
};

const TotalAmountInput: React.FC<{}> = () => {
  // State
  const [isTokenSelectVisible, handleOpen, hideTokenSelect] = useToggle();
  const [fulfillToken, setFulfillToken] = useAtom(fulfillTokenAtom);

  // helpers
  useSetBaseToken();

  const erc20TokenMap = useTokenMap<ERC20Token | NativeToken>([
    BEAN,
    ETH,
    WETH,
  ]);

  // Farmer
  const balances = useFarmerBalances();

  return (
    <>
      <TokenSelectDialog
        open={isTokenSelectVisible}
        handleClose={hideTokenSelect}
        handleSubmit={(_tokens: Set<Token>) => {
          const toArr = Array.from(_tokens);
          toArr.length && setFulfillToken(toArr[0]);
        }}
        selected={[fulfillToken]}
        balances={balances}
        tokenList={Object.values(erc20TokenMap)}
        mode={TokenSelectMode.SINGLE}
      />
      <AtomBNInput
        atom={fulfillAmountAtom}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Typography color="text.primary" variant="caption">
                TOTAL
              </Typography>
            </InputAdornment>
          ),
          endAdornment: fulfillToken && (
            <TokenAdornment
              iconSize="xs"
              textVariant={'bodySmall' as TypographyVariant}
              token={fulfillToken}
              onClick={handleOpen}
              disabled={false}
            />
          ),
        }}
      />
    </>
  );
};

const SubmitBuyOrder: React.FC<{}> = () => {
  const fields = useAtomValue(buyFieldsAtomAtom);

  const submit = useCallback(() => {
    console.log('submitting order... ');
  }, []);

  return (
    <Button variant="contained" color="primary" size="medium" onClick={submit}>
      {fields.orderType === PodOrderType.ORDER ? 'Order Pods' : 'Fill Order'}
    </Button>
  );
};

const CreateBuyOrder: React.FC<{}> = () => (
  <>
    <PlaceInLineSlider />
    <Stack gap={0.8}>
      {/*
       *(max) place in line input
       */}
      <AtomBNInput
        atom={placeInLineAtom}
        disabled
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Typography
                color="text.primary"
                variant="caption"
                sx={{ mt: 0.2 }}
              >
                MAX PLACE IN LINE
              </Typography>
            </InputAdornment>
          ),
        }}
      />
      <Divider />
      <Row spacing={0.8} width="100%">
        {/*
         * fixed / dynamic pricing fn select
         */}
        <BuyPricingFnSelect />
        {/*
         * payment amount in beans
         */}
        <AtomBNInput
          atom={fulfillAmountAtom}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography
                  color="text.primary"
                  variant="caption"
                  sx={{ mt: 0.2 }}
                >
                  PRICE
                </Typography>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="start">
                <Typography
                  color="text.primary"
                  variant="caption"
                  sx={{ ml: 0.5, mt: 0.2 }}
                >
                  BEAN
                </Typography>
              </InputAdornment>
            ),
          }}
        />
      </Row>
      <Divider />
      <TotalAmountInput />
    </Stack>
  </>
);

const FillSellOrder: React.FC<{}> = () => {
  const selected = useAtomValue(selectedListingAtom);
  const setFulfillAmount = useSetAtom(fulfillAmountAtom);
  const amountAtom = atom(
    useMemo(() => selected?.amount || ZERO_BN, [selected])
  );

  useSetBaseToken();
  useEffect(() => {
    if (selected) {
      setFulfillAmount(selected.amount.times(selected.pricePerPod));
    }
  }, [selected, setFulfillAmount]);

  return (
    <Stack gap={0.8}>
      <Stack gap={1.6}>
        {!selected && (
          <Typography variant="caption" color="text.primary" sx={{ pb: 1 }}>
            SELECT A POD LISTING ON THE CHART TO BUY FROM
          </Typography>
        )}
        {selected && (
          <Typography variant="caption" color="text.primary">
            POD LISTING {selected.id}
          </Typography>
        )}
      </Stack>
      <PlaceInLineSlider disabled={!selected} canSlide={false} />
      {selected && (
        <>
          <InfoRow label="PRICE" infoVariant="caption" labelVariant="caption">
            {`${displayFullBN(selected?.pricePerPod || ZERO_BN, 2)} BEAN`}
          </InfoRow>
          <InfoRow
            label="AMOUNT LISTED"
            infoVariant="caption"
            labelVariant="caption"
          >
            {`${displayFullBN(selected?.remainingAmount || ZERO_BN, 2)} PODS`}
          </InfoRow>
          <Divider />
          <Stack spacing={0.8}>
            <AtomBNInput
              atom={fulfillAmountAtom}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography variant="caption" color="text.primary">
                      TOTAL
                    </Typography>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="text.primary">
                      BEANS
                    </Typography>
                  </InputAdornment>
                ),
              }}
              disableInput
            />
            <AtomBNInput
              atom={amountAtom}
              disableInput
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography
                      variant="caption"
                      color="text.primary"
                      sx={{ mt: 0.2 }}
                    >
                      AMOUNT
                    </Typography>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="start">
                    <Typography
                      variant="caption"
                      color="text.primary"
                      sx={{ ml: 0.2, mt: 0.2 }}
                    >
                      PODS @ {displayBN(selected?.placeInLine || ZERO_BN)} IN
                      LINE
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </>
      )}
    </Stack>
  );
};

const BuyPods: React.FC<{}> = () => {
  const orderType = useAtomValue(podsOrderTypeAtom);

  return (
    <Stack>
      <Stack sx={{ p: 0.8 }} gap={1.6}>
        {/* buy or sell toggle */}
        <BuyOrderType />
        <Stack px={0.4}>
          {/* create buy order */}
          {orderType === PodOrderType.ORDER && <CreateBuyOrder />}
          {orderType === PodOrderType.FILL && <FillSellOrder />}
        </Stack>
      </Stack>
      <Divider />
      {/* submit buy order */}
      <Stack p={0.8}>
        <SubmitBuyOrder />
      </Stack>
    </Stack>
  );
};

export default BuyPods;
