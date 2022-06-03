import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import {
  Box, Button,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import BigNumber from 'bignumber.js';
import BalanceModule from 'components/Balances/BalanceModule';
import {
  walletStrings,
  walletTopStrings
} from 'components/Common';
import {
  theme
} from 'constants/index';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import {
  chainId, disconnect, getBlockTimestamp,
  getWalletAddress, poolForLP
} from 'util/index';
import WalletEvent from './WalletEvent';

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
  menuItemStyle: {
    minHeight: '44px',
    padding: '5px',
    whiteSpace: 'normal',
    fontSize: 'small',
    borderBottom: `1px solid ${theme.module.foreground}`,
  },
  walletListStyle: {
    width: 365,
    marginTop: 4,
    overflow: 'auto',
    maxHeight: 500,
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
});

/**
 *
 */
export default function WalletModule() {
  const walletTitles = ['My Balances', 'Transactions'];
  const walletSubtitles = ['Bean', 'ETH', 'LP', 'Field', 'Other'];
  const props = {
    walletTitles: walletTitles,
    walletSubtitles: walletSubtitles
  };
  const classes = useStyles(props);

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
    ethReserve,
    beanlusdPrice,
    beanlusdVirtualPrice,
    beanlusdReserve,
    lusdReserve,
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

  const [walletEvents, setWalletEvents] = useState([]);

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

  useEffect(() => {
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

    async function buildWalletEvents() {
      const timestampPromisesByBlockNumber = {};
      contractEvents.forEach((event) => {
        if (timestampPromisesByBlockNumber[event.blockNumber] === undefined) {
          timestampPromisesByBlockNumber[event.blockNumber] = getBlockTimestamp(
            event.blockNumber
          );
        }
      });
      const blockNumbers = Object.keys(timestampPromisesByBlockNumber);
      const blockTimePromises = Object.values(timestampPromisesByBlockNumber);
      Promise.all(blockTimePromises).then((blockTimestamps) => {
        const timestampsByBlockNumber = {};
        blockTimestamps.forEach((timestamp, index) => {
          const blockNumber = blockNumbers[index];
          timestampsByBlockNumber[blockNumber] = timestamp;
        });

        const filteredEvents = [];
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

        const batchedEvents = [];
        let currentBlock = {};
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
              const batchedEvent = {};
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
            return ['BeanDeposit', 'BeanWithdraw', 'BeanClaim'].includes(
              event.event
            );
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
            return ['Vote', 'Unvote', 'Incentivization'].includes(
              event.event
            );
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
              <WalletEvent event={event} />
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