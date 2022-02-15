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
      Curve Bean Price: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{`$${curveTuple.price.toFixed(4)}`}
      <br />
      &nbsp;&nbsp;{`Liquidity: $${displayBN(curveTuple.liquidity)}`}
    </>
    : null;

  const currentBeanPrice = beanPrice && beanPrice.isGreaterThan(0) && (
    <FormatTooltip
      placement="right"
      title={
        <>
          {`Uniswap Bean Price: $${uniTuple.price.toFixed(4)}`}
          <br />
          &nbsp;&nbsp;{`Liquidity: $${displayBN(uniTuple.liquidity)}`}
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
