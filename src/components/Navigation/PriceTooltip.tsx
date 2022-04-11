import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Button, Tooltip } from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { AppState } from 'state';
import { CryptoAsset, displayBN } from 'util/index';
import { theme } from 'constants/index';
import { UNISWAP_CONTRACT_LINK, CURVE_LINK, LUSD_LINK } from 'constants/links';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

import uniswapLogo from 'img/uniswap-icon.svg';
import curveLogo from 'img/curve-logo.svg';
import lusdLogo from 'img/lusd-icon.svg';
import TokenIcon from 'components/Common/TokenIcon';

export const FormatTooltip = withStyles(() => ({
  tooltip: {
    backgroundColor: 'transparent',
    color: 'black',
    boxShadow: 'none',
    fontSize: 12,
    fontFamily: 'Futura-Pt-Book',
    zIndex: 9999,
    maxWidth: 'none', // prevent wrapping
    margin: (props: any) => props.margin || '24px 0',
    padding: 0,
  },
}))(Tooltip);

const useStyles = makeStyles({
  sidebarExpansionContainer: {
    backgroundColor: 'white',
    width: '100%',
    borderBottom: '1px solid #ddd',
    paddingBottom: 10,
  },
  aggregatePrice: {
    fontSize: 14,
    lineHeight: '13px',
    color: theme.backgroundText,
    fontFamily: 'Futura',
    marginLeft: '10px',
    fontWeight: 500,
    borderRadius: 4,
    paddingRight: 4,
    paddingLeft: 4,
  },
  accordionIcon: {
    fontSize: 14,
    lineHeight: 14,
    verticalAlign: 'bottom'
  },
  cardsContainer: {
    display: 'flex',
    fontSize: 16,
  },
  poolButton: {
    display: 'block', // so flexbox works
  },
  poolCard: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: '8px 8px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center',
    textTransform: 'none'
  },
  poolLogo: {
    height: 23
  },
  poolPrice: {
    fontSize: 13,
    padding: '0 8px',
    fontFamily: 'Lucida Console',
    fontWeight: 500,
  },
  poolMeta: {
    flex: 1,
    fontSize: 11,
    lineHeight: '15px'
  },
  poolMetaRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  poolMetaRowLabel: {
    textAlign: 'right',
    width: 46,
    marginRight: 4,
    opacity: 0.5,
  }
});

export default function PriceTooltip({
  isMobile = false,
  allowExpand = true
}) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const {
    beanPrice,
    priceTuple,
    uniTuple,
    curveTuple,
    beanlusdTuple,
  } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );
  // remove this logic once new Price Contract
  const PriceCards = ({ direction = 'row' }) => (
    <div className={classes.cardsContainer} style={{ flexDirection: direction }}>
      {/* Uniswap */}
      <Button className={classes.poolButton} href={UNISWAP_CONTRACT_LINK} target="_blank" rel="noreferrer">
        <Box className={classes.poolCard} boxShadow="2">
          <img src={uniswapLogo} alt="Uniswap Logo" className={classes.poolLogo} style={{ marginTop: -4 }} />
          <span className={classes.poolPrice}>${uniTuple.price.toFixed(4)}</span>
          <div className={classes.poolMeta}>
            <div className={classes.poolMetaRow}>
              <div className={classes.poolMetaRowLabel}>liquidity:</div>
              <div>${displayBN(uniTuple.liquidity)}</div>
            </div>
            <div className={classes.poolMetaRow}>
              <div className={classes.poolMetaRowLabel}>delta:</div>
              <div>{uniTuple.deltaB.isNegative() ? '' : '+'}{displayBN(uniTuple.deltaB, true)}<TokenIcon token={CryptoAsset.Bean} /></div>
            </div>
          </div>
        </Box>
      </Button>
      {/* Curve */}
      <Button className={classes.poolButton} href={CURVE_LINK} target="_blank" rel="noreferrer">
        <Box className={classes.poolCard} boxShadow="2">
          <img src={curveLogo} alt="Curve Logo" className={classes.poolLogo} />
          <span className={classes.poolPrice}>${curveTuple.price.toFixed(4)}</span>
          <div className={classes.poolMeta}>
            <div className={classes.poolMetaRow}>
              <div className={classes.poolMetaRowLabel}>liquidity:</div>
              <div>${displayBN(curveTuple.liquidity)}</div>
            </div>
            <div className={classes.poolMetaRow}>
              <div className={classes.poolMetaRowLabel}>delta:</div>
              <div>{curveTuple.deltaB.isNegative() ? '' : '+'}{displayBN(curveTuple.deltaB, true)}<TokenIcon token={CryptoAsset.Bean} /></div>
            </div>
          </div>
        </Box>
      </Button>
      {/* LUSD */}
      <Button className={classes.poolButton} href={LUSD_LINK} target="_blank" rel="noreferrer">
        <Box className={classes.poolCard} boxShadow="2">
          <img src={lusdLogo} alt="LUSD Logo" className={classes.poolLogo} />
          <span className={classes.poolPrice}>${beanlusdTuple.price.toFixed(4)}</span>
          <div className={classes.poolMeta}>
            <div className={classes.poolMetaRow}>
              <div className={classes.poolMetaRowLabel}>liquidity:</div>
              <div>${displayBN(beanlusdTuple.liquidity)}</div>
            </div>
            <div className={classes.poolMetaRow}>
              <div className={classes.poolMetaRowLabel}>delta:</div>
              <div>{beanlusdTuple.deltaB.isNegative() ? '' : '+'}{displayBN(beanlusdTuple.deltaB, true)}<TokenIcon token={CryptoAsset.Bean} /></div>
            </div>
          </div>
        </Box>
      </Button>
    </div>
  );

  // Open popover after component mounts. This ensures that `ref` is
  // populated so we can position things correctly by default.
  useEffect(() => {
    if (!isMobile) setOpen(true);
  }, [isMobile]);

  if (!beanPrice || beanPrice.isLessThan(0)) return null;

  if (allowExpand === false) {
    return (
      <div className={classes.aggregatePrice}>
        {priceTuple.price.toFixed(4)}
      </div>
    );
  }

  return isMobile ? (
    <FormatTooltip
      margin="24px 0 24px 0" // Reduce the top margin
      interactive
      open={open}
      placement="bottom-end"
      style={{
        marginTop: 0,
      }}
      PopperProps={{
        disablePortal: true,
        style: {
          width: 280,
          marginLeft: -5,
        }
      }}
      title={(
        <Box className={classes.sidebarExpansionContainer}>
          <PriceCards direction="column" />
        </Box>
      )}
    >
      <Button onClick={() => setOpen(!open)} className={classes.aggregatePrice}>
        {`$${priceTuple.price.toFixed(4)}`}
        {open
          ? <KeyboardArrowUpIcon className={classes.accordionIcon} />
          : <KeyboardArrowDownIcon className={classes.accordionIcon} />}
      </Button>
    </FormatTooltip>
  ) : (
    <FormatTooltip
      margin="-3px 18px" // -6 centers on the NavigationBar
      interactive
      open={isMobile ? false : open}
      placement="right-end"
      title={<PriceCards />}
      PopperProps={{
        popperOptions: {
          // Disable the popper's response to scroll events and make its position fixed.
          // This is because we're using the Popper's `portal`
          // as a hack to display it outside of <NavigationSidebar />.
          eventsEnabled: false,
          positionFixed: true
        }
      }}
    >
      <Button onClick={() => setOpen(!open)} className={classes.aggregatePrice}>
        {`$${priceTuple.price.toFixed(4)}`}
        {open
          ? <ChevronLeftIcon className={classes.accordionIcon} />
          : <ChevronRightIcon className={classes.accordionIcon} />}
      </Button>
    </FormatTooltip>
  );
}
