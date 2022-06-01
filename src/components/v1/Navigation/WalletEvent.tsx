import {
  Box
} from '@mui/material';
import BigNumber from 'bignumber.js';
import {
  ClaimableAsset,
  CryptoAsset,
  FarmAsset,
  SiloAsset,
  TokenTypeImageModule,
  TransitAsset
} from 'components/Common';
import {
  BEAN,
  ETH,
  UNI_V2_ETH_BEAN_LP,
  WITHDRAWAL_FROZEN
} from 'constants/index';
import React from 'react';
import { PodListingFilledEvent, PodOrderFilledEvent } from 'state/marketplace/updater';
import {
  account, displayBN, Token, toTokenUnitsBN
} from 'util/index';
import { makeStyles } from '@mui/styles';

//
const tokenImageStyle = {
  height: '15px',
  float: 'right',
  margin: '0px 8px 0px 4px',
};

const useStyles = makeStyles({
  outerBox: {
    width: '100%',
    paddingLeft: '3px'
  },
  width100Percent: {
    width: '100%'
  },
  eventTitleStyle: {
    display: 'inline-block',
    maxWidth: '60',
    fontFamily: 'Futura-PT-Book',
    fontSize: '14px',
  },
  timestampStyle: {
    width: '100%',
    fontFamily: 'Futura-PT-Book',
    fontSize: '13px',
    color: 'gray',
    fontStyle: 'normal',
  },
  eventAmountStyle: {
    display: 'inline-block',
    marginTop: '10px',
    height: '100%',
    width: '40%',
    fontFamily: 'Lucida Console',
    fontSize: '12px',
    textAlign: 'right',
    float: 'right',
    paddingRight: '3%',
  },
  outText: {
    color: 'green',
    display: 'block',
    marginTop: '-7px',
    width: '100%',
  },
  inText: {
    color: 'red',
    display: 'block',
    width: '100%',
  },
  colorGreen: {
    color: 'green'
  },
  shiftTokenFlowUp: {
    // temporary hack instead of rebuilding this component from scratch
    marginTop: '-7px', 
  }
});

/**
 * Token Flow with respect to the User.
 * - "in"  = I receive something.
 * - "out" = I spend something.
 */
const TokenFlow : React.FC<{
  in?:  [BigNumber, Token],
  out?: [BigNumber, Token]
}> = (props) => {
  const classes = useStyles();
  return (
    <div className={props.in && props.out ? classes.shiftTokenFlowUp : undefined}>
      {props.out ? (
        <div>
          <span style={{ color: 'red' }}>{`-${displayBN(props.out[0])}`}</span>
          <TokenTypeImageModule style={tokenImageStyle} token={props.out[1]} />
        </div>
      ) : null}
      {props.in ? (
        <div>
          <span style={{ color: 'green' }}>{`+${displayBN(props.in[0])}`}</span>
          <TokenTypeImageModule style={tokenImageStyle} token={props.in[1]} />
        </div>
      ) : null}
    </div>
  );
};

/**
 *
 */
export default function WalletEvent({ event }) {
  const classes = useStyles({});
  let eventTitle = `Event Name: ${event.event}`;
  let eventAmount;
  switch (event.event) {
    case 'BeanDeposit': {
      const s = event.returnValues.season;
      const beans = toTokenUnitsBN(
        new BigNumber(event.returnValues.beans),
        BEAN.decimals
      );
      eventTitle = `Bean Deposit (Season${s})`;
      eventAmount = (
        <TokenFlow
          in={[beans, SiloAsset.Bean]}
        />
      );
      break;
    }
    case 'BeanClaim': {
      const beans = toTokenUnitsBN(
        new BigNumber(event.returnValues.beans),
        BEAN.decimals
      );

      eventTitle = 'Bean Claim';
      eventAmount = (
        <TokenFlow
          out={[beans, ClaimableAsset.Bean]}
          in={[beans, CryptoAsset.Bean]}
        />
      );
      break;
    }
    case 'BeanWithdraw': {
      const s = parseInt(event.returnValues.season, 10);
      const beans = toTokenUnitsBN(
        new BigNumber(event.returnValues.beans),
        BEAN.decimals
      );

      eventTitle = `Bean Withdrawal (Season ${s - WITHDRAWAL_FROZEN})`;
      eventAmount = (
        <TokenFlow
          out={[beans, SiloAsset.Bean]} 
          in={[beans, TransitAsset.Bean]}
        />
      );
      break;
    }
    case 'Sow': {
      const pods = toTokenUnitsBN(event.returnValues.pods, BEAN.decimals);

      if (event.returnValues.beans !== undefined) {
        const beans = toTokenUnitsBN(event.returnValues.beans, BEAN.decimals);
        const weather = pods
          .dividedBy(beans)
          .minus(new BigNumber(1))
          .multipliedBy(100)
          .toFixed(0);

        eventTitle = `Bean Sow (${weather}% Weather)`;
        eventAmount = (
          <TokenFlow
            out={[beans, CryptoAsset.Bean]}
            in={[pods, FarmAsset.Pods]}
          />
        );
      } else {
        eventTitle = 'Bean Sow';
        eventAmount = (
          <>
            <span style={{ color: 'green' }}>{displayBN(pods)}</span>
            <TokenTypeImageModule
              style={tokenImageStyle}
              token={FarmAsset.Pods}
            />
          </>
        );
      }
      break;
    }
    case 'Harvest': {
      const beans = toTokenUnitsBN(
        new BigNumber(event.returnValues.beans),
        BEAN.decimals
      );

      eventTitle = 'Pod Harvest';
      eventAmount = (
        <TokenFlow
          out={[beans, FarmAsset.Pods]}
          in={[beans, CryptoAsset.Bean]}
        />
      );  
      break;
    }
    case 'LPDeposit': {
      const s = event.returnValues.season;
      const lp = toTokenUnitsBN(
        new BigNumber(event.returnValues.lp),
        UNI_V2_ETH_BEAN_LP.decimals
      );

      eventTitle = `LP Deposit (Season${s})`;
      eventAmount = (
        <TokenFlow
          in={[lp, SiloAsset.LP]}
        />
      );
      break;
    }
    case 'LPClaim': {
      const lp = toTokenUnitsBN(
        new BigNumber(event.returnValues.lp),
        UNI_V2_ETH_BEAN_LP.decimals
      );

      eventTitle = 'LP Claim';
      eventAmount = (
        <TokenFlow
          out={[lp, ClaimableAsset.LP]}
          in={[lp, CryptoAsset.LP]}
        />
      );
      break;
    }
    case 'LPWithdraw': {
      const s = parseInt(event.returnValues.season, 10);
      const lp = toTokenUnitsBN(
        new BigNumber(event.returnValues.lp),
        UNI_V2_ETH_BEAN_LP.decimals
      );

      eventTitle = `LP Withdrawal (Season ${s - WITHDRAWAL_FROZEN})`;
      eventAmount = (
        <TokenFlow
          out={[lp, SiloAsset.LP]}
          in={[lp, TransitAsset.LP]}
        />
      );
      break;
    }
    case 'Vote': {
      eventTitle = 'BIP Vote';
      eventAmount = (
        <span style={{ color: 'green', fontFamily: 'Futura-PT-Book' }}>
          {`BIP ${event.returnValues.bip}`}
        </span>
      );
      break;
    }
    case 'Unvote': {
      eventTitle = 'BIP Unvote';
      eventAmount = (
        <span style={{ color: 'red', fontFamily: 'Futura-PT-Book' }}>
          {`BIP ${event.returnValues.bip}`}
        </span>
      );
      break;
    }
    case 'Incentivization': {
      const beanReward = toTokenUnitsBN(
        new BigNumber(event.returnValues.beans),
        BEAN.decimals
      );

      eventTitle = 'Sunrise Reward';
      eventAmount = <TokenFlow out={[beanReward, CryptoAsset.Bean]} />;
      break;
    }
    case 'Swap': {
      if (event.returnValues.amount0In !== '0') {
        const swapFrom = toTokenUnitsBN(
          new BigNumber(event.returnValues.amount0In),
          ETH.decimals
        );
        const swapTo = toTokenUnitsBN(
          new BigNumber(event.returnValues.amount1Out),
          BEAN.decimals
        );

        eventTitle = 'ETH to Bean Swap';
        eventAmount = (
          <TokenFlow
            out={[swapFrom, CryptoAsset.Ethereum]}
            in={[swapTo, CryptoAsset.Bean]}
          />
        );
      } else if (event.returnValues.amount1In !== '0') {
        const swapFrom = toTokenUnitsBN(
          new BigNumber(event.returnValues.amount1In),
          BEAN.decimals
        );
        const swapTo = toTokenUnitsBN(
          new BigNumber(event.returnValues.amount0Out),
          ETH.decimals
        );

        eventTitle = 'Bean to ETH Swap';
        eventAmount = (
          <TokenFlow
            out={[swapFrom, CryptoAsset.Bean]}
            in={[swapTo, CryptoAsset.Ethereum]}
          />
        );
      }
      break;
    }
    case 'PlotTransfer': {
      const pods = toTokenUnitsBN(
        new BigNumber(event.returnValues.pods),
        BEAN.decimals
      );
      if (event.returnValues.from.toLowerCase() === account) {
        eventTitle = 'Send Plot';
        eventAmount = (
          <TokenFlow
            out={[pods, FarmAsset.Pods]}
          />
        );
      } else {
        eventTitle = 'Receive Plot';
        eventAmount = (
          <TokenFlow
            in={[pods, FarmAsset.Pods]}
          />
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
      const values = (event.returnValues as PodOrderFilledEvent);
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
      const values = (event.returnValues as PodListingFilledEvent);
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

  const date = new Date(event.timestamp * 1e3);
  const dateString = date.toLocaleDateString('en-US');
  const timeString = date.toLocaleTimeString('en-US');

  return (
    <Box className={classes.outerBox}>
      <Box className={classes.width100Percent}>
        <Box className={classes.eventTitleStyle}>
          {eventTitle}
          <br />
          <Box className={classes.timestampStyle}>{`${dateString} ${timeString}`}</Box>
        </Box>
        <Box className={classes.eventAmountStyle}>{eventAmount}</Box>
      </Box>
    </Box>
  );
}
