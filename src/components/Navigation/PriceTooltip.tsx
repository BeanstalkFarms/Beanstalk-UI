import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Button, makeStyles, Popover, Theme, Tooltip, withStyles } from '@material-ui/core';
import { AppState } from 'state';
import { CryptoAsset, displayBN } from 'util/index';
import { theme } from 'constants/index';
import { UNISWAP_CONTRACT_LINK, CURVE_LINK } from 'constants/links';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

import uniswapLogo from 'img/uniswap-icon.svg';
import curveLogo from 'img/curve-logo.svg';
import TokenIcon from 'components/Common/TokenIcon';

export const FormatTooltip = withStyles((t: Theme) => ({
  tooltip: {
    backgroundColor: 'transparent',
    color: 'black',
    boxShadow: 'none',
    fontSize: 12,
    fontFamily: 'Futura-Pt-Book',
    zIndex: 9999,
    maxWidth: 'none' // prevent wrapping
  },
}))(Tooltip);

const useStyles = makeStyles({
  aggregatePrice: {
    fontSize: 14,
    lineHeight: '13px',
    color: theme.backgroundText,
    fontFamily: "Futura",
    marginLeft: '10px',
    fontWeight: 500,
    borderRadius: 4,
    cursor: "pointer",
    paddingRight: 4,
    paddingLeft: 4,
  },
  accordionIcon: {
    fontSize: 14,
    lineHeight: 14,
    verticalAlign: "bottom"
  },
  cardsContainer: {
    display: "flex",
    fontSize: 16,
  },
  poolButton: {
    display: "block", // so flexbox works
  },
  poolCard: {
    backgroundColor: "white",
    borderRadius: 4,
    padding: "8px 8px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    textTransform: "none"
  },
  poolLogo: {
    height: 23
  },
  poolPrice: {
    fontSize: 13,
    padding: "0 14px",
    fontFamily: "Lucida Console",
    fontWeight: 500,
  },
  poolMeta: {
    fontSize: 11,
    lineHeight: "15px"
  },
  poolMetaRow: {
    display: "flex",
    flexDirection: "row",
  },
  poolMetaRowLabel: {
    textAlign: "right",
    width: 46,
    marginRight: 4,
    opacity: 0.5,
  }
});

export default function PriceTooltip() {
  const ref = useRef(null);
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const {
    beanPrice,
    priceTuple,
    uniTuple,
    curveTuple,
  } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  const displayCurve = theme.name !== 'ropsten' ?
    <>
      <br />
      Curve
      <br />
      &nbsp;&nbsp;{`Price: $${curveTuple.price.toFixed(4)}`}
      <br />
      &nbsp;&nbsp;{`Liquidity: $${displayBN(curveTuple.liquidity)}`}
      <br />
      &nbsp;&nbsp;{`Delta B: ${displayBN(curveTuple.deltaB, true)}`}
    </>
    : null;

  const PriceCards = ({ direction = 'row' }) => {
    return (
      <div className={classes.cardsContainer} style={{ flexDirection: direction }}>
        {/* Uniswap */}
        <Button className={classes.poolButton} href={UNISWAP_CONTRACT_LINK} target="_blank" rel="noreferrer">
          <Box className={classes.poolCard} boxShadow="2">
            <img src={uniswapLogo} alt="Uniswap Logo" className={classes.poolLogo} />
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
      </div>
    )
  }

  // Open popover after component mounts. This ensures that `ref` is
  // populated so we can position things correctly by default.
  useEffect(() => {
    setOpen(true)
  }, []);

  return (beanPrice && beanPrice.isGreaterThan(0)) ? (
    <FormatTooltip
      interactive
      open={open}
      placement="right-end"
      title={<PriceCards />}
    >
      <Button onClick={() => setOpen(!open)} className={classes.aggregatePrice}>
        {`$${priceTuple.price.toFixed(4)}`}
        {open ? <ChevronLeftIcon className={classes.accordionIcon} /> : <ChevronRightIcon className={classes.accordionIcon} />}
      </Button>
    </FormatTooltip>
  ) : null; 
}
