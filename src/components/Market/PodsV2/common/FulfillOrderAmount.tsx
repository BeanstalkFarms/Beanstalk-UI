import { InputAdornment, Typography, TypographyVariant } from '@mui/material';
import React from 'react';
import Token, { ERC20Token, NativeToken } from '~/classes/Token';
import { TokenAdornment, TokenSelectDialog } from '~/components/Common/Form';
import { TokenSelectMode } from '~/components/Common/Form/TokenSelectDialog';
import { BEAN, ETH, WETH } from '~/constants/tokens';
import useTokenMap from '~/hooks/chain/useTokenMap';
import useToggle from '~/hooks/display/useToggle';
import useFarmerBalances from '~/hooks/farmer/useFarmerBalances';
import { fulfillAmountAtom, useFulfillTokenAtom } from '../info/atom-context';
import AtomInputField from '~/components/Common/Atom/AtomInputField';

const FulfillOrderAmount: React.FC<{}> = () => {
  // State
  const [isTokenSelectVisible, handleOpen, hideTokenSelect] = useToggle();
  const [fulfillToken, setFulfillToken] = useFulfillTokenAtom();

  console.log('rerenxcer...');

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
      <AtomInputField
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

export default FulfillOrderAmount;
