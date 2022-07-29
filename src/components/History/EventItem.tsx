import React from 'react';
import { Box, Divider, Link, Stack, Tooltip, Typography } from '@mui/material';
import { displayBN, toTokenUnitsBN } from 'util/index';
import BigNumber from 'bignumber.js';
import Token from 'classes/Token';
import { BEAN, PODS, SILO_WHITELIST } from 'constants/tokens';
import { SupportedChainId } from 'constants/chains';
import { Event } from 'lib/Beanstalk/EventProcessor';
import TokenIcon from '../Common/TokenIcon';
import useTokenMap from '../../hooks/useTokenMap';

export interface EventItemProps {
  event: Event;
  account: string;
}

/**
 * Token Display with respect to the User.
 * - "in"  = I receive something.
 * - "out" = I spend something.
 */
const TokenDisplay: React.FC<{
  color?: 'green' | 'red';
  input?: [BigNumber, Token],
}> = (props) => (
  <div>
    {props.input ? (
      <Stack direction="row" gap={0.3} alignItems="center">
        <Typography variant="body1" style={{ color: props.color }}>
          {props.color === 'red' ? '-' : '+'}
        </Typography>
        <TokenIcon token={props.input[1]} />
        <Typography variant="body1" style={{ color: props.color }}>
          {`${displayBN(props.input[0])}`}
        </Typography>
      </Stack>
    ) : null}
  </div>
);

const EventItem: React.FC<EventItemProps> = ({ event, account }) => {
  // const [expanded, setExpanded] = useState(false);
  let eventTitle = `${event.event}`;
  let amountIn;
  let amountOut;
  
  const siloTokens = useTokenMap(SILO_WHITELIST);
  
  const processTokenEvent = (e: Event, title: string, showInput?: boolean, showOutput?: boolean) => {
    const tokenAddr = e.args?.token.toString().toLowerCase();
      if (siloTokens[tokenAddr]) {
        const token = siloTokens[tokenAddr];
        const amount = toTokenUnitsBN(
          new BigNumber(event.args?.amount.toString()),
            token.decimals
        );
        eventTitle = `${title} ${token.symbol}`;
        if (showInput) {
          amountIn = (
            <TokenDisplay color="green" input={[amount, token]} />
          );
        }
        if (showOutput) {
          amountOut = (
            <TokenDisplay color="red" input={[amount, token]} />
          );
        }
      }
  };

  switch (event.event) {
    case 'AddDeposit': {
      processTokenEvent(event, 'Deposit', true, false);
      break;
    }
    case 'AddWithdrawal': {
      processTokenEvent(event, 'Withdraw', false, true);
      break;
    }
    case 'AddWithdrawals': {
      processTokenEvent(event, 'Add Withdrawals of', false, true);
      break;
    }
    // claim from silo
    case 'RemoveWithdrawal': {
      processTokenEvent(event, 'Remove Withdrawn', true, false);
      break;
    }
    case 'RemoveWithdrawals': {
      processTokenEvent(event, 'Remove Withdrawals of', false, true);
      break;
    }
    case 'Chop': {
      processTokenEvent(event, 'Chop', true, false);
      break;
    }
    case 'Pick': {
      processTokenEvent(event, 'Pick', true, false);
      break;
    }
    case 'Rinse': {
      processTokenEvent(event, 'Rinse', true, false);
      break;
    }
    case 'Sow': {
      const pods = toTokenUnitsBN(event.args?.pods.toString(), BEAN[SupportedChainId.MAINNET].decimals);
      if (event.args?.beans.toString() !== undefined) {
        const beans = toTokenUnitsBN(event.args?.beans.toString(), BEAN[SupportedChainId.MAINNET].decimals);

        const weather = pods
          .dividedBy(beans)
          .minus(new BigNumber(1))
          .multipliedBy(100)
          .toFixed(0);

        eventTitle = `Bean Sow (${weather}% Weather)`;
        amountOut = (
          <TokenDisplay color="red" input={[beans, BEAN[SupportedChainId.MAINNET]]} />
        );
        amountIn = (
          <TokenDisplay color="green" input={[pods, PODS]} />
        );
      } else {
        eventTitle = 'Bean Sow';
        amountIn = (
          <TokenDisplay color="green" input={[pods, PODS]} />
        );
      }
      break;
    }
    case 'Harvest': {
      const beans = toTokenUnitsBN(
        new BigNumber(event.args?.beans.toString()),
        BEAN[SupportedChainId.MAINNET].decimals
      );

      eventTitle = 'Pod Harvest';
      amountOut = (
        <TokenDisplay color="red" input={[beans, PODS]} />
      );
      amountIn = (
        <TokenDisplay color="green" input={[beans, BEAN[SupportedChainId.MAINNET]]} />
      );
      break;
    }
    // FIXME: need to add Bean inflows here.
    // Technically we need to look up the price of the Pod Order
    // during this Fill by scanning Events. This is too complex to
    // do efficiently in the frontend so it should be likely be
    // moved to the subgraph.
    case 'PodOrderFilled': {
      const values = event.args;
      // const pods = toTokenUnitsBN(values.amount, BEAN.decimals);
      if (values?.to.toString().toLowerCase() === account) {
        // My Pod Order was "Filled".
        // I lose Beans, gain the Plot.
        eventTitle = 'Bought Plot';
      } else {
        // I "Filled" a Pod Order (sold my plot)
        // I lose the plot, gain Beans.
        eventTitle = 'Purchase Plot';
      }
      break;
    }
    case 'PlotTransfer': {
      const pods = toTokenUnitsBN(
        new BigNumber(event.args?.pods.toString()),
        BEAN[SupportedChainId.MAINNET].decimals
      );
      if (event.args?.from.toString().toLowerCase() === account) {
        eventTitle = 'Send Plot';
        amountOut = (
          <TokenDisplay color="red" input={[pods, PODS]} />
        );
      } else {
        eventTitle = 'Receive Plot';
        amountIn = (
          <TokenDisplay color="green" input={[pods, PODS]} />
        );
      }
      break;
    }
    default:
      break;
  }

  // Don't display certain processed events like "RemoveDeposits"
  if (amountIn === undefined && amountOut === undefined) {
    return null;
  }

  return (
    <>
      <Box py={1}>
        <Stack direction="row" gap={0.2} justifyContent="space-between">
          <Stack direction="column">
            {/* Event title */}
            <Typography variant="h4">{eventTitle}</Typography>
            {/* Timestamps */}
            <Stack direction="row">
              <Tooltip placement="right" title="View transaction on Etherscan.">
                <Link underline="none" color="text.secondary" sx={{ textDecoration: 'none' }} href={`https://etherscan.io/tx/${event.transactionHash}`} target="_blank" rel="noreferrer">
                  {event?.args?.season ? (
                    <Typography color="text.secondary">Season {event.args?.season.toString()}</Typography>
                  ) : (
                    <Typography color="text.secondary">{`Block ${event.blockNumber}`}</Typography>
                  )}
                </Link>
              </Tooltip>
            </Stack>
          </Stack>
          <Stack direction="column" alignItems="flex-end">
            {amountOut}
            {amountIn}
          </Stack>
        </Stack>
        {/* {expanded && (
          <Box sx={{ backgroundColor: "#f8f8f8", borderRadius: 1, p: 1, mt: 1 }}>
            {event.returnValues?.length?.toString() || 'none'}
            {Array(event.returnValues.length).fill(null).map((_, index) => (
              <div key={index}>
                <Typography>{event.returnValues[index + event.returnValues.length]} {event.returnValues[index]?.toString()}</Typography>
              </div>
            ))}
          </Box>
        )} */}
      </Box>
      <Divider />
    </>
  );
};

export default EventItem;

  // const [eventDatetime, setEventDatetime] = useState('');
  //
  // const handleSetDatetime = () => {
  //   getBlockTimestamp(event.blockNumber).then((t) => {
  //     const date = new Date(t * 1e3);
  //     const dateString = date.toLocaleDateString('en-US');
  //     const timeString = date.toLocaleTimeString('en-US');
  //     setEventDatetime(`${dateString} ${timeString}`);
  //   });
  // };

  // useEffect(() => {
  //   /** This is NOT an optimal way to get timestamps for events.
  //    * A more ideal solution will 1) be off-chain and 2) not
  //    * repeat calls for the same block number. - Cool Bean */
  //   function handleSetDatetimeTwo() {
  //     getBlockTimestamp(event.blockNumber).then((t) => {
  //       const date = new Date(t * 1e3);
  //       const dateString = date.toLocaleDateString('en-US');
  //       const timeString = date.toLocaleTimeString('en-US');
  //       setEventDatetime(`${dateString} ${timeString}`);
  //     });
  //   }
  //
  //   handleSetDatetimeTwo();
  // }, [event.blockNumber]);

// ----- CODE TO HANDLE SWAPS -----
// case 'Swap': {
    //   if (event.args?.amount0In.toString() !== '0') {
    //     const swapFrom = toTokenUnitsBN(
    //       new BigNumber(event.args?.amount0In.toString()),
    //       ETH[SupportedChainId.MAINNET].decimals
    //     );
    //     const swapTo = toTokenUnitsBN(
    //       new BigNumber(event.args?.amount1Out.toString()),
    //       BEAN[SupportedChainId.MAINNET].decimals
    //     );
    //
    //     eventTitle = 'ETH to Bean Swap';
    //     amountOut = (
    //       <TokenDisplay color="red" input={[swapFrom, ETH[SupportedChainId.MAINNET]]} />
    //     );
    //     amountIn = (
    //       <TokenDisplay color="green" input={[swapTo, BEAN[SupportedChainId.MAINNET]]} />
    //     );
    //   } else if (event.args?.amount1In.toString() !== '0') {
    //     const swapFrom = toTokenUnitsBN(
    //       new BigNumber(event.args?.amount1In.toString()),
    //       BEAN[SupportedChainId.MAINNET].decimals
    //     );
    //     const swapTo = toTokenUnitsBN(
    //       new BigNumber(event.args?.amount0Out.toString()),
    //       ETH[SupportedChainId.MAINNET].decimals
    //     );
    //
    //     eventTitle = 'Bean to ETH Swap';
    //     amountOut = (
    //       <TokenDisplay color="red" input={[swapFrom, BEAN[SupportedChainId.MAINNET]]} />
    //     );
    //     amountIn = (
    //       <TokenDisplay color="green" input={[swapTo, ETH[SupportedChainId.MAINNET]]} />
    //     );
    //   }
    //   break;
    // }
