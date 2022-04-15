import React, { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { EventData } from 'web3-eth-contract';
import {
  Button,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Box,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

import { AppState } from 'state';
import {
  BEAN,
  ETH,
  UNI_V2_ETH_BEAN_LP,
  WITHDRAWAL_FROZEN,
  theme,
} from 'constants/index';
import {
  chainId,
  displayBN,
  getBlockTimestamp,
  getWalletAddress,
  toTokenUnitsBN,
  poolForLP,
  disconnect,
  account,
  Token,
} from 'util/index';
import {
  ClaimableAsset,
  CryptoAsset,
  FarmAsset,
  SiloAsset,
  TokenTypeImageModule,
  TransitAsset,
  walletStrings,
  walletTopStrings,
} from 'components/Common';
import BalanceModule from 'components/Balances/BalanceModule';
import { PodListingFilledEvent, PodOrderFilledEvent } from 'state/marketplace/updater';

type EventDataWithTimestamp = (EventData & { timestamp: number });
type BatchedEvent = {
  event: string;
  returnValues: any;
  transactionHash: string;
  timestamp: number;
}
type CurrentBlock = {
  number: number;
  transactionHash: string;
  timestamp: number;
}

//
const tokenImageStyle = {
  height: '15px',
  float: 'right',
  margin: '0px 8px 0px 4px',
};

//
const useStyles = makeStyles({
  walletButton: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 18,
    pdadingRight: 18,
    textDecoration: 'none',
    color: theme.accentText,
    textTransform: 'none',
    fontFamily: 'Futura-PT-Book',
    fontWeight: 'bold',
    backgroundColor: theme.secondary,
    '&:hover': {
      backgroundColor: theme.activeSection,
    },
  },
  shiftTokenFlowUp: {
    // temporary hack instead of rebuilding this component from scratch
    marginTop: '-7px', 
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
  menuItemStyle: {
    minHeight: '44px',
    padding: '5px',
    whiteSpace: 'normal',
    fontSize: 'small',
    borderBottom: `1px solid ${theme.module.foreground}`,
  },
  timestampStyle: {
    width: '100%',
    fontFamily: 'Futura-PT-Book',
    fontSize: '13px',
    color: 'gray',
    fontStyle: 'normal',
  },
  eventTitleStyle: {
    display: 'inline-block',
    maxWidth: '60',
    fontFamily: 'Futura-PT-Book',
    fontSize: '14px',
  },
  walletListStyle: {
    width: 365,
    marginTop: 4,
    overflow: 'auto',
    maxHeight: 500,
  },
  outerBox: {
    width: '100%',
    paddingLeft: '3px'
  },
  walletTitles: {
    width: '100%',
    height: '40px',
    position: 'sticky',
    top: '0px',
    backgroundColor: theme.module.background,
    zIndex: 99,
  },
  walletTitleButton: {
    borderBottom: `2px solid ${theme.module.background}`,
    borderRadius: '0px',
    height: '100%',
    width: (props: any) => `calc(100% / ${props.walletTitles.length})`,
    display: 'inline-block',
    fontSize: 'medium',
    padding: '5px',
    cursor: 'pointer',
    textTransform: 'none',
    backgroundColor: theme.module.background,
    textAlign: 'center',
    fontFamily: 'Futura-PT-Book',
  },
  walletDisplayBox: {
    zIndex: 1,
    width: '100%',
    height: '40px',
    backgroundColor: theme.module.background,
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
  walletSubtitlesButton: {
    borderBottom: `1px solid ${theme.module.background}`,
    borderRadius: '0px',
    height: '100%',
    width: (props: any) => `calc(100% / ${props.walletSubtitles.length})`,
    display: 'inline-block',
    fontSize: 'medium',
    padding: '5px',
    cursor: 'pointer',
    textTransform: 'none',
    backgroundColor: theme.module.foreground,
    textAlign: 'center',
    fontFamily: 'Futura-PT-Book',
  },
  disconnectBox: {
    width: '100%',
    height: '40px',
    position: 'sticky',
    bottom: '0px',
    backgroundColor: theme.module.background,
    zIndex: 99,
  },
  disconnectButton: {
    fontWeight: 'bold',
    textTransform: 'none'
  },
  walletPageBox: {
    backgroundColor: theme.module.background,
    paddingTop: '0px',
  },
  noPadding: {
    padding: '0px'
  },
  width100Percent: {
    width: '100%'
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
function DisplayEvent({ event }) {
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

        eventTitle = 'Bean Claim';
        eventAmount = inOutDisplay(
          beans,
          ClaimableAsset.Bean,
          beans,
          CryptoAsset.Bean
        );
        break;
      }
      case 'BeanWithdraw': {
        const s = parseInt(event.returnValues.season, 10);
        const beans = toTokenUnitsBN(
          new BigNumber(event.returnValues.beans),
          BEAN.decimals
        );

        eventTitle = `Bean Sow (${weather}% Weather)`;
        eventAmount = (
          <TokenFlow
            out={[beans, CryptoAsset.Bean]}
            in={[pods, FarmAsset.Pods]}
          />
        );
        break;
      }
      case 'Sow': {
        const pods = toTokenUnitsBN(event.returnValues.pods, BEAN.decimals);

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

        eventTitle = 'ETH to Bean Swap';
        eventAmount = (
          <TokenFlow
            out={[swapFrom, CryptoAsset.Ethereum]}
            in={[swapTo, CryptoAsset.Bean]}
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
        eventAmount = outDisplay(beanReward, CryptoAsset.Bean);
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
          eventAmount = inOutDisplay(
            swapFrom,
            CryptoAsset.Ethereum,
            swapTo,
            CryptoAsset.BEAN
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
          eventAmount = inOutDisplay(
            swapFrom,
            CryptoAsset.BEAN,
            swapTo,
            CryptoAsset.Ethereum
          );
        }
        break;
      }
      case 'EtherClaim': {
        const ethReward = toTokenUnitsBN(
          new BigNumber(event.returnValues.ethereum),
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
      default:
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
        <Box style={eventAmountStyle}>{eventAmount}</Box>
      </Box>
    );
  }
  // State selectors
  const {
    lpBalance,
    lpSiloBalance,
    lpTransitBalance,
    lpReceivableBalance,
    curveBalance,
    curveSiloBalance,
    curveTransitBalance,
    curveReceivableBalance,
    beanlusdBalance,
    beanlusdSiloBalance,
    beanlusdTransitBalance,
    beanlusdReceivableBalance,
    beanBalance,
    beanSiloBalance,
    beanTransitBalance,
    beanReceivableBalance,
    beanWrappedBalance,
    harvestablePodBalance,
    stalkBalance,
    seedBalance,
    ethBalance,
    podBalance,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
  const {
    beanCrv3Price,
    beanPrice,
    beanReserve,
    beanCrv3Reserve,
    curveVirtualPrice,
    crv3Reserve,
    beanlusdPrice,
    beanlusdVirtualPrice,
    beanlusdReserve,
    lusdReserve,
    ethReserve,
  } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );
  const { totalLP, totalCrv3, totalBeanlusd, totalStalk } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  const { contractEvents } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  // Local state
  const [walletText, setWalletText] = useState('Wallet');
  const anchorRefWallet = React.useRef<any>(null);
  const [openWallet, setOpenWallet] = React.useState(false);
  const handleToggleWallet = () => {
    setOpenWallet((prevOpen) => !prevOpen);
  };
  const handleCloseWallet = () => {
    setOpenWallet(false);
  };

  const [walletEvents, setWalletEvents] = useState<BatchedEvent[]>([]);

  // Helpers
  const poolForLPRatio = (amount: BigNumber) => {
    if (amount.isLessThanOrEqualTo(0)) return [new BigNumber(-1), new BigNumber(-1)];
    return poolForLP(amount, beanReserve, ethReserve, totalLP);
  };
  const poolForCurveRatio = (amount: BigNumber) => {
    if (amount.isLessThanOrEqualTo(0)) {
      return [new BigNumber(0), new BigNumber(0)];
    }
    return poolForLP(amount, beanCrv3Reserve, crv3Reserve, totalCrv3);
  };
  const poolForBeanlusdRatio = (amount: BigNumber) => {
    if (amount.isLessThanOrEqualTo(0)) {
      return [new BigNumber(0), new BigNumber(0)];
    }
    return poolForLP(amount, beanlusdReserve, lusdReserve, totalBeanlusd);
  };

  // Load
  useEffect(() => {
    /**
     * 
     */
    async function handleWallet() {
      getWalletAddress().then((accountHex) => {
        if (accountHex !== undefined) {
          const accountDisplay = `${accountHex.substr(
            0,
            6
          )}...${accountHex.substr(accountHex.length - 4, 4)}`;
          setWalletText(accountDisplay);
        } else {
          console.log('handleWallet: account is undefined.');
        }
      });
    }

    /**
     * 
     */
    async function buildWalletEvents() {
      const timestampPromisesByBlockNumber : {[blockNumber: string] : Promise<number> } = {};

      console.log(`[wallet] Building transactions from ${contractEvents.length} events.`);

      contractEvents.forEach((event) => {
        if (timestampPromisesByBlockNumber[event.blockNumber.toString()] === undefined) {
          timestampPromisesByBlockNumber[event.blockNumber.toString()] = getBlockTimestamp(
            event.blockNumber
          ) as Promise<number>;
        }
      });

      const blockNumbers = Object.keys(timestampPromisesByBlockNumber);
      const blockTimePromises = Object.values(timestampPromisesByBlockNumber);

      Promise.all(blockTimePromises).then((blockTimestamps) => {
        const timestampsByBlockNumber : { [blockNumber: string] : number } = {};
        blockTimestamps.forEach((timestamp, index) => {
          const blockNumber = blockNumbers[index];
          timestampsByBlockNumber[blockNumber] = timestamp;
        });

        const filteredEvents : EventDataWithTimestamp[] = [];
        contractEvents.forEach((event) => {
          if (event.event === 'BeanRemove' || event.event === 'LPRemove') {
            return;
          }
          filteredEvents.push({
            ...event,
            timestamp: timestampsByBlockNumber[event.blockNumber],
          });
        });
        filteredEvents.sort((a, b) => {
          const blockDiff = b.blockNumber - a.blockNumber;
          return blockDiff === 0 ? b.logIndex - a.logIndex : blockDiff;
        });

        const batchedEvents : BatchedEvent[] = [];
        let currentBlock : CurrentBlock = {};
        let pendingAmountsPerType = {};
        let pendingSeasonsPerType = {};

        filteredEvents.forEach((event, index) => {
          function seasonsDisplay(season) {
            return season.min === season.max
              ? ` ${season.min}`
              : `s ${season.min}-${season.max}`;
          }
          function flushPendingAmounts() {
            // eslint-disable-next-line
            for (const type in pendingAmountsPerType) {
              const batchedEvent : BatchedEvent = {};
              switch (type) {
                case 'BeanDeposit': {
                  batchedEvent.event = type;
                  batchedEvent.returnValues = {
                    beans: pendingAmountsPerType[type],
                    season: seasonsDisplay(pendingSeasonsPerType[type]),
                  };
                  batchedEvents.push(batchedEvent);
                  break;
                }
                case 'LPDeposit': {
                  batchedEvent.event = type;
                  batchedEvent.returnValues = {
                    lp: pendingAmountsPerType[type],
                    season: seasonsDisplay(pendingSeasonsPerType[type]),
                  };
                  batchedEvents.push(batchedEvent);
                  break;
                }
                case 'Sow': {
                  batchedEvent.event = type;
                  batchedEvent.returnValues = pendingAmountsPerType[type];
                  batchedEvents.push(batchedEvent);
                  break;
                }
                default:
                  break;
              }
              batchedEvent.transactionHash = currentBlock.transactionHash;
              batchedEvent.timestamp = currentBlock.timestamp;
            }
            pendingAmountsPerType = {};
            pendingSeasonsPerType = {};
          }
          const lastElement = index === filteredEvents.length - 1;

          if (currentBlock.number !== event.blockNumber) {
            flushPendingAmounts();
            currentBlock = {
              number: event.blockNumber,
              transactionHash: event.transactionHash,
              timestamp: event.timestamp,
            };
          }

          function updateSeasons(pendingSeasons, season) {
            pendingSeasons.min = Math.min(pendingSeasons.min, season);
            pendingSeasons.max = Math.max(pendingSeasons.max, season);
            return pendingSeasons;
          }

          /* Special Handling for events that may repeat in a single block */
          switch (event.event) {
            case 'BeanDeposit': {
              const beans = new BigNumber(event.returnValues.beans);
              const pendingBeans = pendingAmountsPerType[event.event];
              pendingAmountsPerType[event.event] =
                pendingBeans === undefined ? beans : beans.plus(pendingBeans);

              const { season } = event.returnValues;
              const pendingSeasons = pendingSeasonsPerType[event.event];
              pendingSeasonsPerType[event.event] =
                pendingSeasons === undefined
                  ? { min: season, max: season }
                  : updateSeasons(pendingSeasons, season);
              if (lastElement) flushPendingAmounts();
              return;
            }
            case 'LPDeposit': {
              const lp = new BigNumber(event.returnValues.lp);
              const pendingLP = pendingAmountsPerType[event.event];
              pendingAmountsPerType[event.event] =
                pendingLP === undefined ? lp : lp.plus(pendingLP);
              const { season } = event.returnValues;
              const pendingSeasons = pendingSeasonsPerType[event.event];
              pendingSeasonsPerType[event.event] =
                pendingSeasons === undefined
                  ? { min: season, max: season }
                  : updateSeasons(pendingSeasons, season);
              if (lastElement) flushPendingAmounts();
              return;
            }
            case 'Sow': {
              const pods = new BigNumber(event.returnValues.pods);
              const beans = new BigNumber(event.returnValues.beans);
              const pending = pendingAmountsPerType[event.event];
              pendingAmountsPerType[event.event] = {
                pods: pending === undefined ? pods : pods.plus(pending.pods),
                beans:
                  pending === undefined ? beans : beans.plus(pending.beans),
              };
              if (lastElement) flushPendingAmounts();
              return;
            }
            default:
              break;
          }
          batchedEvents.push(event);
        });
        setWalletEvents(batchedEvents);
      });
    }
    handleWallet();
    buildWalletEvents();
  }, [contractEvents]);

  //
  const [transactionPage, setTransactionPage] = useState(-1);
  const walletEventsDisplay = (
    <>
      <Box
        className={classes.walletDisplayBox}
      >
        {walletSubtitles.map((title, index) => (
          <Button
            key={`transaction_page_${index}`} // eslint-disable-line
            onClick={() => {
              if (transactionPage === index) {
                setTransactionPage(-1);
              } else {
                setTransactionPage(index);
              }
              document.getElementById('wallet-list-paper').scrollTop = 0;
            }}
            className={classes.walletSubtitlesButton}
          >
            {title}
          </Button>
        ))}
      </Box>
      {walletEvents
        .filter((event) => {
          if (transactionPage === 0) {
            return ['BeanDeposit', 'BeanWithdraw', 'BeanClaim'].includes(event.event);
          }
          if (transactionPage === 1) {
            return ['Swap'].includes(event.event);
          }

          if (transactionPage === 2) {
            return ['LPDeposit', 'LPWithdraw', 'LPClaim'].includes(event.event);
          }

          if (transactionPage === 3) {
            return ['Sow', 'Harvest'].includes(event.event);
          }

          if (transactionPage === 4) {
            return ['Vote', 'Unvote', 'Incentivization'].includes(event.event);
          }
          return true;
        })
        .map((event, index) => {
          const ropstenPrefix = chainId === 3 ? 'ropsten.' : '';
          const etherscanURL = `https://${ropstenPrefix}etherscan.io/tx/${event.transactionHash}`;
          return (
            <MenuItem
              onClick={() => window.open(etherscanURL)}
              className={classes.menuItemStyle}
              key={`menu_item_${index}`} // eslint-disable-line
            >
              <DisplayEvent event={event} />
            </MenuItem>
          );
        })}
    </>
  );

  //
  const userLP = lpBalance
    .plus(lpSiloBalance)
    .plus(lpTransitBalance)
    .plus(lpReceivableBalance);
  const userBeans = beanBalance
    .plus(beanSiloBalance)
    .plus(beanTransitBalance)
    .plus(beanReceivableBalance)
    .plus(beanWrappedBalance)
    .plus(harvestablePodBalance);
  const userCurve = curveBalance
    .plus(curveSiloBalance)
    .plus(curveTransitBalance)
    .plus(curveReceivableBalance);
  const userBeanlusd = beanlusdBalance
    .plus(beanlusdSiloBalance)
    .plus(beanlusdTransitBalance)
    .plus(beanlusdReceivableBalance);

  const userBeansAndEth = poolForLPRatio(userLP);
  const userBeansAndCrv3 = poolForCurveRatio(userCurve);
  const userBeansAndLusd = poolForBeanlusdRatio(userBeanlusd);
  const userLPBeans = userBeansAndEth[0].multipliedBy(2);

  const userCurveBalanceInDollars = (
    userBeansAndCrv3[0]
    .multipliedBy(beanCrv3Price)
    .plus(userBeansAndCrv3[1])
  ).multipliedBy(curveVirtualPrice);

  const userBeanlusdBalanceInDollars = (
    userBeansAndLusd[0]
    .multipliedBy(beanlusdPrice)
    .plus(userBeansAndLusd[1])
  ).multipliedBy(beanlusdVirtualPrice);

  const userBalanceInDollars = beanPrice.isGreaterThan(0)
    ? userBeans
      .plus(userLPBeans)
      .multipliedBy(beanPrice)
      .plus(userCurveBalanceInDollars)
      .plus(userBeanlusdBalanceInDollars)
    : new BigNumber(0);

  //
  const myBalancesSection = (
    <>
      <BalanceModule
        description={walletStrings}
        strings={walletTopStrings}
        topLeft={userBalanceInDollars}
        topRight={stalkBalance.dividedBy(totalStalk).multipliedBy(100)}
        beanReserveTotal={new BigNumber(0)}
        beanLPTotal={userBeansAndEth}
        beanCurveTotal={userBeansAndCrv3}
        beanlusdTotal={userBeansAndLusd}
        poolForLPRatio={poolForLPRatio}
        poolForCurveRatio={poolForCurveRatio}
        poolForBeanlusdRatio={poolForBeanlusdRatio}
        beanBalance={beanBalance}
        beanSiloBalance={beanSiloBalance}
        beanTransitBalance={beanTransitBalance}
        beanReceivableBalance={beanReceivableBalance}
        beanWrappedBalance={beanWrappedBalance}
        harvestablePodBalance={harvestablePodBalance}
        lpBalance={lpBalance}
        lpSiloBalance={lpSiloBalance}
        lpTransitBalance={lpTransitBalance}
        lpReceivableBalance={lpReceivableBalance}
        curveBalance={curveBalance}
        curveSiloBalance={curveSiloBalance}
        curveTransitBalance={curveTransitBalance}
        curveReceivableBalance={curveReceivableBalance}
        beanlusdBalance={beanlusdBalance}
        beanlusdSiloBalance={beanlusdSiloBalance}
        beanlusdTransitBalance={beanlusdTransitBalance}
        beanlusdReceivableBalance={beanlusdReceivableBalance}
        stalkBalance={stalkBalance}
        seedBalance={seedBalance}
        ethBalance={ethBalance}
        podBalance={podBalance}
        showTokenName={false}
        padding="4px 0 0 0"
        chartMargin="0 0 0 10px"
      />
    </>
  );

  //
  const [walletPage, setWalletPage] = useState(0);
  const walletPages = [myBalancesSection, walletEventsDisplay];

  //
  return (
    <>
      <Button
        variant="contained"
        onClick={() => handleToggleWallet()}
        className={classes.walletButton}
        ref={anchorRefWallet}
        aria-controls={openWallet ? 'wallet-list-grow' : undefined}
        aria-haspopup="true"
        startIcon={<AccountBalanceWalletOutlinedIcon />}
      >
        {walletText}
      </Button>
      <Popper
        open={openWallet}
        anchorEl={anchorRefWallet.current}
        role={undefined}
        transition
        disablePortal
        placement="bottom-end"
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: 'center top' }}>
            <Paper id="wallet-list-paper" className={classes.walletListStyle}>
              <ClickAwayListener onClickAway={handleCloseWallet}>
                <MenuList
                  className={classes.noPadding}
                  autoFocusItem={openWallet}
                  id="wallet-list-grow"
                >
                  <Box className={classes.walletTitles}>
                    {/* Tab buttons ("My Balances", "Transactions") */}
                    {walletTitles.map((title, index) => (
                      <Button
                        key={`wallet_button_${index}`} // eslint-disable-line
                        onClick={() => {
                          setWalletPage(index);
                          setTransactionPage(-1);
                          document.getElementById('wallet-list-paper').scrollTop = 0;
                        }}
                        className={classes.walletTitleButton}
                      >
                        {title}
                      </Button>
                    ))}
                  </Box>
                  {/* Content (depends on selected tab) */}
                  <Box
                    className={classes.walletPageBox}
                  >
                    {walletPages[walletPage]}
                  </Box>
                  <Box
                    className={classes.disconnectBox}>
                    <Button
                      fullWidth
                      variant="text"
                      className={classes.disconnectButton}
                      onClick={() => disconnect()}
                    >
                      Disconnect
                    </Button>
                  </Box>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}
