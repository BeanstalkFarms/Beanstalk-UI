import React, { useCallback } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Button, Card, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import gearIcon from 'img/gear.svg';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TokenInputField from '../Common/Form/TokenInputField';
import { Token } from '../../../classes';
import { ERC20Token, NativeToken } from '../../../classes/Token';
import { displayBN } from '../../../util';
import { TokensByAddress } from '../../../constants/v2/tokens';
import { BalanceState } from '../../../state/v2/farmer/balances/reducer';
import fertilizerOpenedIcon from '../../../img/fertilizer-opened.svg';
import beanCircleIcon from '../../../img/bean-circle.svg';
import chevronDownIcon from '../../../img/chevron-down.svg';
import splitArrowsIcon from '../../../img/split-arrows.svg';
import AccordionWrapper from '../Common/AccordionWrapper';
import TransactionDetailsAccordion from "./TransactionDetailsAccordion";
import PurchaseDropdown from "./PurchaseDropdown";

export interface BarnraiseFormProps {
  amount: BigNumber;
  handleSetAmount: (val?: string | BigNumber) => void;
  from: NativeToken | ERC20Token;
  handleSetFrom: (val?: any) => void; // TODO: Add type
  erc20TokenList: TokensByAddress<Token> | never[];
  balances: BalanceState;
}

const BarnraisePurchaseForm: React.FC<BarnraiseFormProps> =
  ({
     amount,
     handleSetAmount,
     from,
     handleSetFrom,
     erc20TokenList,
     balances
   }:
     BarnraiseFormProps
  ) => {
    const handleMax = useCallback(() => {
      handleSetAmount(balances[from.address]);
    }, [handleSetAmount, balances, from]);

    // const handleReset = useCallback(() => {
    //   handleSetAmount(new BigNumber(-1));
    // }, [handleSetAmount]);

    return (
      <Card sx={{ p: 2 }}>
        <Stack gap={1}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6">Purchase Fertilizer</Typography>
            <Button
              sx={{
                p: 0,
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'transparent',
                  opacity: 0.8
                }
              }}
            >
              <img alt="" src={gearIcon} width="31px" />
            </Button>
          </Stack>
          <form>
            {/* {from.address} {from.name} {balances[from.address]?.toString()} */}
            <Stack gap={1}>
              {/* Deposit Amount */}
              <TokenInputField
                amount={amount}
                setAmount={handleSetAmount}
                token={from}
                setToken={(t: Token) => handleSetFrom(t as ERC20Token)}
                tokenList={erc20TokenList}
              />
              {/* Max Module */}
              <Stack direction="row" alignItems="center" spacing={0.5} px={0.75}>
                <Stack direction="row" alignItems="center" sx={{ flex: 1 }} spacing={1}>
                  {/* {token === ETH ? (
                      <>
                        <Typography variant="body1" sx={{ fontSize: 13.5 }}>
                          = {displayBN(usdcAmount)} USDC
                        </Typography>
                        {quoting && <CircularProgress variant="indeterminate" size="small" sx={{ width: 14, height: 14 }} />}
                      </>
                    ) : null} */}
                </Stack>
                <Typography sx={{ fontSize: 13.5 }}>
                  Balance: {balances[from.address] ? displayBN(balances[from.address]) : '0'}
                </Typography>
                <Typography
                  variant="body1"
                  onClick={handleMax}
                  color="primary"
                  sx={{ fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
                >
                  (Max)
                </Typography>
              </Stack>
              {/* Output */}
              {amount.gt(0) ? (
                <PurchaseDropdown amount={amount} />
              ) : null}
              <Button disabled type="submit" size="large" fullWidth>
                Input Amount
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    );
  };

export default BarnraisePurchaseForm;
