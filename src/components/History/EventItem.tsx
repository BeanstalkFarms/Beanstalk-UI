import React from 'react';
import { Divider, Link, Stack, Tooltip, Typography } from '@mui/material';
import { ParsedEvent } from 'state/farmer/events/updater';
import { displayBN, toTokenUnitsBN } from 'util/index';
import BigNumber from 'bignumber.js';
import Token from 'classes/Token';
import { BEAN, BEAN_ETH_UNIV2_LP, ETH, PODS } from 'constants/tokens';
import { SupportedChainId } from 'constants/chains';
import { PodListingFilledEventObject, PodOrderFilledEventObject } from 'constants/generated/Beanstalk/Beanstalk';
import TokenIcon from '../Common/TokenIcon';

export interface EventItemProps {
  event: ParsedEvent;
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
      <Stack direction="row" gap={0.1}>
        <Typography style={{ color: props.color }}>
          {props.color === 'red' ? '-' : '+'}
        </Typography>
        <TokenIcon token={props.input[1]} />
        <Typography style={{ color: props.color }}>
          {`${displayBN(props.input[0])}`}
        </Typography>
      </Stack>
    ) : null}
  </div>
);

const EventItem: React.FC<EventItemProps> = ({ event, account }) => {
  let eventTitle = `${event.event}`;
  let amountIn;
  let amountOut;

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

  switch (event.event) {
    case 'BeanDeposit': {
      // const s = event.returnValues.season;
      const beans = toTokenUnitsBN(
        new BigNumber(event.returnValues.beans),
        BEAN[SupportedChainId.MAINNET].decimals
      );
      eventTitle = 'Bean Deposit';
      amountIn = (
        <TokenDisplay color="green" input={[beans, BEAN[SupportedChainId.MAINNET]]} />
      );
      break;
    }
    case 'BeanClaim': {
      const beans = toTokenUnitsBN(
        new BigNumber(event.returnValues.beans),
        BEAN[SupportedChainId.MAINNET].decimals
      );

      eventTitle = 'Bean Claim';
      amountOut = (
        <TokenDisplay color="red" input={[beans, BEAN[SupportedChainId.MAINNET]]} />
      );
      amountIn = (
        <TokenDisplay color="green" input={[beans, BEAN[SupportedChainId.MAINNET]]} />
      );
      break;
    }
    case 'BeanWithdraw': {
      // const s = parseInt(event.returnValues.season, 10);
      const beans = toTokenUnitsBN(
        new BigNumber(event.returnValues.beans),
        BEAN[SupportedChainId.MAINNET].decimals
      );

      eventTitle = 'Bean Withdrawal'; // TODO: add withdraw frozen
      amountOut = (
        <TokenDisplay color="red" input={[beans, BEAN[SupportedChainId.MAINNET]]} />
      );
      amountIn = (
        <TokenDisplay color="green" input={[beans, BEAN[SupportedChainId.MAINNET]]} />
      );
      break;
    }
    case 'Sow': {
      const pods = toTokenUnitsBN(event.returnValues.pods, BEAN[SupportedChainId.MAINNET].decimals);

      if (event.returnValues.beans !== undefined) {
        const beans = toTokenUnitsBN(event.returnValues.beans, BEAN[SupportedChainId.MAINNET].decimals);
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
        new BigNumber(event.returnValues.beans),
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
    case 'LPDeposit': {
      // const s = event.returnValues.season;
      const lp = toTokenUnitsBN(
        new BigNumber(event.returnValues.lp),
        BEAN_ETH_UNIV2_LP[SupportedChainId.MAINNET].decimals
      );

      eventTitle = 'LP Deposit';
      amountIn = (
        <TokenDisplay color="green" input={[lp, BEAN_ETH_UNIV2_LP[SupportedChainId.MAINNET]]} />
      );
      break;
    }
    case 'LPClaim': {
      const lp = toTokenUnitsBN(
        new BigNumber(event.returnValues.lp),
        BEAN_ETH_UNIV2_LP[SupportedChainId.MAINNET].decimals
      );

      eventTitle = 'LP Claim';
      amountOut = (
        <TokenDisplay color="red" input={[lp, BEAN_ETH_UNIV2_LP[SupportedChainId.MAINNET]]} />
      );
      amountIn = (
        <TokenDisplay color="green" input={[lp, BEAN_ETH_UNIV2_LP[SupportedChainId.MAINNET]]} />
      );
      break;
    }
    case 'LPWithdraw': {
      // const s = parseInt(event.returnValues.season, 10);
      const lp = toTokenUnitsBN(
        new BigNumber(event.returnValues.lp),
        BEAN_ETH_UNIV2_LP[SupportedChainId.MAINNET].decimals
      );

      eventTitle = 'LP Withdrawal'; // TODO: add withdraw frozen
      amountOut = (
        <TokenDisplay color="red" input={[lp, BEAN_ETH_UNIV2_LP[SupportedChainId.MAINNET]]} />
      );
      amountIn = (
        <TokenDisplay color="green" input={[lp, BEAN_ETH_UNIV2_LP[SupportedChainId.MAINNET]]} />
      );
      break;
    }
    case 'Vote': {
      eventTitle = 'BIP Vote';
      amountOut = (
        <span style={{ color: 'green', fontFamily: 'Futura-PT-Book' }}>
          {`BIP ${event.returnValues.bip}`}
        </span>
      );
      break;
    }
    case 'Unvote': {
      eventTitle = 'BIP Unvote';
      amountOut = (
        <span style={{ color: 'red', fontFamily: 'Futura-PT-Book' }}>
          {`BIP ${event.returnValues.bip}`}
        </span>
      );
      break;
    }
    case 'Incentivization': {
      const beanReward = toTokenUnitsBN(
        new BigNumber(event.returnValues.beans),
        BEAN[SupportedChainId.MAINNET].decimals
      );

      eventTitle = 'Sunrise Reward';
      amountOut = (
        <TokenDisplay color="red" input={[beanReward, BEAN[SupportedChainId.MAINNET]]} />
      );
      break;
    }
    case 'Swap': {
      if (event.returnValues.amount0In !== '0') {
        const swapFrom = toTokenUnitsBN(
          new BigNumber(event.returnValues.amount0In),
          ETH[SupportedChainId.MAINNET].decimals
        );
        const swapTo = toTokenUnitsBN(
          new BigNumber(event.returnValues.amount1Out),
          BEAN[SupportedChainId.MAINNET].decimals
        );

        eventTitle = 'ETH to Bean Swap';
        amountOut = (
          <TokenDisplay color="red" input={[swapFrom, ETH[SupportedChainId.MAINNET]]} />
        );
        amountIn = (
          <TokenDisplay color="green" input={[swapTo, BEAN[SupportedChainId.MAINNET]]} />
        );
      } else if (event.returnValues.amount1In !== '0') {
        const swapFrom = toTokenUnitsBN(
          new BigNumber(event.returnValues.amount1In),
          BEAN[SupportedChainId.MAINNET].decimals
        );
        const swapTo = toTokenUnitsBN(
          new BigNumber(event.returnValues.amount0Out),
          ETH[SupportedChainId.MAINNET].decimals
        );

        eventTitle = 'Bean to ETH Swap';
        amountOut = (
          <TokenDisplay color="red" input={[swapFrom, BEAN[SupportedChainId.MAINNET]]} />
        );
        amountIn = (
          <TokenDisplay color="green" input={[swapTo, ETH[SupportedChainId.MAINNET]]} />
        );
      }
      break;
    }
    case 'PlotTransfer': {
      const pods = toTokenUnitsBN(
        new BigNumber(event.returnValues.pods),
        BEAN[SupportedChainId.MAINNET].decimals
      );
      if (event.returnValues.from.toLowerCase() === account) {
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
    // FIXME: need to add Bean inflows here.
    // Technically we need to look up the price of the Pod Order
    // during this Fill by scanning Events. This is too complex to
    // do efficiently in the frontend so it should be likely be
    // moved to the subgraph.
    case 'PodOrderFilled': {
      const values = (event.returnValues as PodOrderFilledEventObject);
      // const pods = toTokenUnitsBN(values.amount, BEAN.decimals);
      if (values.to.toLowerCase() === account) {
        // My Pod Order was "Filled".
        // I lose Beans, gain the Plot.
        eventTitle = 'Bought Plot via Farmer\'s Market';
      } else {
        // I "Filled" a Pod Order (sold my plot)
        // I lose the plot, gain Beans.
        eventTitle = 'Sold Plot via Farmer\'s Market';
      }
      break;
    }
    case 'PodListingFilled': {
      const values = (event.returnValues as PodListingFilledEventObject);
      // const pods = toTokenUnitsBN(values.amount, BEAN.decimals);
      if (values.to.toLowerCase() === account) {
        // I "Filled" a Pod Listing (I spent Beans to buy someone's Pods)
        eventTitle = 'Bought Plot via Farmer\'s Market';
      } else {
        // My Pod Listing was "Filled" (someone spent Beans to buy my Pods)
        eventTitle = 'Sold Plot via Farmer\'s Market';
      }
      break;
    }
    default:
      break;
  }

  return (
    <>
      <Stack gap={0.2} pt={1} pb={1}>
        {
          event?.returnValues?.season && (
            <Typography>Season {displayBN(event.returnValues.season)}</Typography>
          )
        }
        <Stack direction="row" justifyContent="space-between">
          <Typography>{eventTitle}</Typography>
          {amountOut}
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Tooltip placement="right" title="View block on Etherscan.">
            <Link underline="none" sx={{ textDecoration: 'none' }} href={`https://etherscan.io/block/${event.blockNumber}`}>
              <Typography color="text.secondary">{`Block ${event.blockNumber}`}</Typography>
            </Link>
          </Tooltip>
          {amountIn}
        </Stack>
      </Stack>
      <Divider />
    </>
  );
};

export default EventItem;
