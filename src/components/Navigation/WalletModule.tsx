import React, { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import {
  Button,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import {
  BEAN,
  ETH,
  UNI_V2_ETH_BEAN_LP,
  WITHDRAWAL_FROZEN,
} from '../../constants';
import {
  chainId,
  displayBN,
  getBlockTimestamp,
  GetWalletAddress,
  toTokenUnitsBN,
} from '../../util';
import {
  ClaimableAsset,
  CryptoAsset,
  FarmAsset,
  SiloAsset,
  TokenTypeImageModule,
  TransitAsset,
  walletDescriptions,
  walletStrings,
} from '../Common';
import BalanceModule from '../Balances/BalanceModule';

export default function WalletModule(props) {
  const classes = makeStyles({
    walletButton: {
      textDecoration: 'none',
      borderRadius: '12px',
      color: 'black',
      textTransform: 'none',
      fontFamily: 'Futura-PT-Book',
      fontSize: '16px',
      padding: '5px 8px',
      marginLeft: '8px',
      '&:hover': {
        backgroundColor: '#61dafb38',
      },
    },
    greenStyle: {
      color: 'green',
      display: 'block',
      marginTop: '-7px',
      width: '100%',
    },
    redStyle: {
      color: 'red',
      display: 'block',
      width: '100%',
    },
  })();

  const tokenImageStyle = {
    height: '15px',
    float: 'right',
    margin: '0px 8px 0px 4px',
  };
  const eventTitleStyle = {
    display: 'inline-block',
    maxWidth: '60',
    fontFamily: 'Futura-PT-Book',
    fontSize: '14px',
  };
  const timestampStyle = {
    width: '100%',
    fontFamily: 'Futura-PT-Book',
    fontSize: '13px',
    color: 'gray',
    fontStyle: 'normal',
  };
  const eventAmountStyle = {
    display: 'inline-block',
    marginTop: '10px',
    height: '100%',
    width: '40%',
    fontFamily: 'Lucida Console',
    fontSize: '12px',
    textAlign: 'right',
    float: 'right',
    paddingRight: '3%',
  };
  const menuItemStyle = {
    minHeight: '44px',
    padding: '5px',
    whiteSpace: 'normal',
    fontSize: 'small',
    borderBottom: '1px solid #ccc',
  };
  const [walletListStyle, setWalletListStyle] = useState({
    position: 'absolute',
    right: '-120px',
    top: '1px',
    width: '365px',
    maxHeight: '395px',
    overflow: 'scroll',
  });

  const [walletText, setWalletText] = useState('Wallet');
  const anchorRefWallet = React.useRef<any>(null);
  const [openWallet, setOpenWallet] = React.useState(false);
  const handleToggleWallet = () => {
    setWalletListStyle((prev) => ({
      ...prev,
      right: window.innerWidth < 600 ? '-170px' : '-120px',
    }));
    setOpenWallet((prevOpen) => !prevOpen);
  };
  const handleCloseWallet = () => {
    setOpenWallet(false);
  };

  const [walletEvents, setWalletEvents] = useState([]);

  useEffect(() => {
    async function handleWallet() {
      GetWalletAddress().then((accountHex) => {
        if (accountHex !== undefined) {
          const accountDisplay = `${accountHex.substr(
            0,
            6
          )}...${accountHex.substr(accountHex.length - 4, 4)}`;
          setWalletText(accountDisplay);
        } else {
          console.log('Please Install Metamask!');
        }
      });
    }

    async function buildWalletEvents() {
      const timestampPromisesByBlockNumber = {};
      props.events.forEach((event) => {
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
        props.events.forEach((event) => {
          if (event.event === 'BeanRemove' || event.event === 'LPRemove') {
            return;
          }
          filteredEvents.push({ ...event, timestamp: timestampsByBlockNumber[event.blockNumber] });
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
            for (const type in pendingAmountsPerType) { // eslint-disable-line
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
  }, [props.events]);

  function displayEvent(event) {
    const inOutDisplay = (inBN, inToken, outBN, outToken) => (
      <>
        <span className={classes.greenStyle}>
          {`+${displayBN(outBN)}`}{' '}
          <TokenTypeImageModule style={tokenImageStyle} token={outToken} />
        </span>
        <span className={classes.redStyle}>
          {`-${displayBN(inBN)}`}{' '}
          <TokenTypeImageModule style={tokenImageStyle} token={inToken} />
        </span>
      </>
    );
    const outDisplay = (outBN, outToken) => (
      <>
        <span style={{ color: 'green' }}>{`+${displayBN(outBN)}`}</span>
        <TokenTypeImageModule style={tokenImageStyle} token={outToken} />
      </>
    );

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
        eventAmount = outDisplay(beans, SiloAsset.Bean);
        break;
      }
      case 'BeanClaim': {
        const beans = toTokenUnitsBN(
          new BigNumber(event.returnValues.beans),
          BEAN.decimals
        );

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

        eventTitle = `Bean Withdrawal (Season ${s - WITHDRAWAL_FROZEN})`;
        eventAmount = inOutDisplay(
          beans,
          SiloAsset.Bean,
          beans,
          TransitAsset.Bean
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
          eventAmount = inOutDisplay(
            beans,
            CryptoAsset.Bean,
            pods,
            FarmAsset.Pods
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
        eventAmount = inOutDisplay(
          beans,
          FarmAsset.Pods,
          beans,
          CryptoAsset.Bean
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
        eventAmount = outDisplay(lp, SiloAsset.LP);
        break;
      }
      case 'LPClaim': {
        const lp = toTokenUnitsBN(
          new BigNumber(event.returnValues.lp),
          UNI_V2_ETH_BEAN_LP.decimals
        );

        eventTitle = 'LP Claim';
        eventAmount = inOutDisplay(lp, ClaimableAsset.LP, lp, CryptoAsset.LP);
        break;
      }
      case 'LPWithdraw': {
        const s = parseInt(event.returnValues.season, 10);
        const lp = toTokenUnitsBN(
          new BigNumber(event.returnValues.lp),
          UNI_V2_ETH_BEAN_LP.decimals
        );

        eventTitle = `LP Withdrawal (Season ${s - WITHDRAWAL_FROZEN})`;
        eventAmount = inOutDisplay(lp, SiloAsset.LP, lp, TransitAsset.LP);
        break;
      }
      case 'Proposal': {
        eventTitle = 'BIP Proposal';
        eventAmount = (
          <span style={{ fontFamily: 'Futura-PT-Book' }}>
            {`BIP ${event.returnValues.bip}`}
          </span>
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

        eventTitle = 'ETH Claim';
        eventAmount = outDisplay(ethReward, CryptoAsset.Ethereum);
        break;
      }
      default:
        break;
    }

    const date = new Date(event.timestamp * 1e3);
    const dateString = date.toLocaleDateString('en-US');
    const timeString = date.toLocaleTimeString('en-US');

    return (
      <Box style={{ width: '100%', paddingLeft: '3px' }}>
        <Box style={{ width: '100%' }}>
          <Box style={eventTitleStyle}>
            {eventTitle}
            <br />
            <Box style={timestampStyle}>{`${dateString} ${timeString}`}</Box>
          </Box>
          <Box style={eventAmountStyle}>{eventAmount}</Box>
        </Box>
      </Box>
    );
  }

  const walletSubtitles = ['Bean', 'ETH', 'LP', 'Field', 'Other'];
  const [transactionPage, setTransactionPage] = useState(-1);
  const walletEventsDisplay = (
    <>
      <Box style={{ zIndex: '1', width: '100%', height: '40px' }}>
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
            style={{
              borderBottom: '1px solid #efefef',
              borderRadius: '0px',
              height: '100%',
              width: `calc(100% / ${walletSubtitles.length})`,
              display: 'inline-block',
              fontSize: 'medium',
              padding: '5px',
              cursor: 'pointer',
              textTransform: 'none',
              backgroundColor: transactionPage === index ? '#EFF7FF' : 'white',
              textAlign: 'center',
              fontFamily: 'Futura-PT-Book',
            }}
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
          if (transactionPage === 1) return ['EtherClaim', 'Swap'].includes(event.event);
          if (transactionPage === 2) return ['LPDeposit', 'LPWithdraw', 'LPClaim'].includes(event.event);
          if (transactionPage === 3) return ['Sow', 'Harvest'].includes(event.event);
          if (transactionPage === 4) {
            return ['Vote', 'Unvote', 'Proposal', 'Incentivization'].includes(
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
              style={menuItemStyle}
              key={`menu_item_${index}`} // eslint-disable-line
            >
              {displayEvent(event)}
            </MenuItem>
          );
        })}
    </>
  );

  const userLP = props.lpBalance
    .plus(props.lpSiloBalance)
    .plus(props.lpTransitBalance)
    .plus(props.lpReceivableBalance);
  const userBeans = props.beanBalance
    .plus(props.beanSiloBalance)
    .plus(props.beanTransitBalance)
    .plus(props.beanReceivableBalance)
    .plus(props.harvestablePodBalance);
  const userBeansAndEth = props.poolForLPRatio(userLP);
  const userLPBeans = userBeansAndEth[0].multipliedBy(2);
  const userBalanceInDollars = userBeans
    .plus(userLPBeans)
    .multipliedBy(props.beanPrice);

  const myBalancesSection = (
    <>
      <BalanceModule
        description={walletDescriptions}
        strings={walletStrings}
        topLeft={userBalanceInDollars}
        topRight={props.stalkBalance
          .dividedBy(props.totalStalk)
          .multipliedBy(100)}
        beanReserveTotal={new BigNumber(0)}
        beanLPTotal={userBeansAndEth}
        padding="4px 0 0 0"
        showTokenName={false}
        chartMargin="0 0 0 10px"
        {...props}
      />
    </>
  );

  const [walletPage, setWalletPage] = useState(0);
  const walletTitles = ['My Balances', 'Transactions'];
  const walletPages = [myBalancesSection, walletEventsDisplay];

  return (
    <>
      <Button
        onClick={() => handleToggleWallet()}
        className={classes.walletButton}
        ref={anchorRefWallet}
        aria-controls={openWallet ? 'wallet-list-grow' : undefined}
        aria-haspopup="true"
      >
        {walletText}
      </Button>
      <Popper
        open={openWallet}
        anchorEl={anchorRefWallet.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: 'center top' }}>
            <Paper id="wallet-list-paper" style={walletListStyle}>
              <ClickAwayListener onClickAway={handleCloseWallet}>
                <MenuList
                  style={{ padding: '0px' }}
                  autoFocusItem={openWallet}
                  id="wallet-list-grow"
                >
                  <Box
                    style={{
                      zIndex: '1',
                      width: '100%',
                      height: '40px',
                      position: 'sticky',
                      top: '0px',
                    }}
                  >
                    {walletTitles.map((title, index) => (
                      <Button
                        key={`wallet_button_${index}`} // eslint-disable-line
                        onClick={() => {
                          setWalletPage(index);
                          setTransactionPage(-1);
                          document.getElementById(
                            'wallet-list-paper'
                          ).scrollTop = 0;
                        }}
                        style={{
                          borderBottom: '2px solid #efefef',
                          borderRadius: '0px',
                          height: '100%',
                          width: `calc(100% / ${walletTitles.length})`,
                          display: 'inline-block',
                          fontSize: 'medium',
                          padding: '5px',
                          cursor: 'pointer',
                          textTransform: 'none',
                          backgroundColor:
                            index !== walletPage ? 'white' : '#EFF7FF',
                          textAlign: 'center',
                          fontFamily: 'Futura-PT-Book',
                        }}
                      >
                        {title}
                      </Button>
                    ))}
                  </Box>
                  <Box style={{ zIndex: '0', paddingTop: '0px' }}>
                    {walletPages[walletPage]}
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
