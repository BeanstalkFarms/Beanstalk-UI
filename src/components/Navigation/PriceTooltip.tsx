import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@material-ui/core';
import { AppState } from 'state';
import { displayBN } from 'util/index';
import { theme } from 'constants/index';
import { FormatTooltip } from 'components/Common';

export default function PriceTooltip() {
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
      &nbsp;&nbsp;{`Delta B: ${displayBN(curveTuple.deltaB)}`}
    </>
    : null;

  const currentBeanPrice = beanPrice && beanPrice.isGreaterThan(0) && (
    <FormatTooltip
      placement="right"
      title={
        <>
          Uniswap
          <br />
          &nbsp;&nbsp;{`Price: $${uniTuple.price.toFixed(4)}`}
          <br />
          &nbsp;&nbsp;{`Liquidity: $${displayBN(uniTuple.liquidity)}`}
          <br />
          &nbsp;&nbsp;{`Delta B: ${displayBN(uniTuple.deltaB)}`}
          {displayCurve}
        </>
      }
    >
      <Box
        style={{
          fontSize: 13,
          lineHeight: '13px',
          color: theme.backgroundText,
          marginLeft: '10px',
        }}
      >
        {`$${priceTuple.price.toFixed(4)}`}
      </Box>
    </FormatTooltip>
  );

  return (<>{currentBeanPrice}</>);
}
