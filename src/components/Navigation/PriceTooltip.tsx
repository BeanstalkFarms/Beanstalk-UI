import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@material-ui/core';
import { AppState } from 'state';
import { displayBN } from 'util/index';
import { theme } from 'constants/index';
import { FormatTooltip } from 'components/Common';

export default function PriceTooltip() {
  const {
    beanReserve,
    beanPrice,
    bean3crvPrice,
    curveVirtualPrice,
    bean3crvReserve,
    crvReserve,
  } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  const priceStyle = {
    fontSize: 13,
    lineHeight: '13px',
    color: theme.backgroundText,
    marginLeft: '10px',
  };

  const beanUniLiqValue = beanReserve.multipliedBy(beanPrice).multipliedBy(2);

  // FIXME: PriceTooltip is loading before CurvePrices get updated so returns undefined
  const beanCurveLiqValue = theme.name !== 'ropsten' && bean3crvPrice !== undefined ?
    (bean3crvReserve.multipliedBy(bean3crvPrice).plus(crvReserve)).multipliedBy(curveVirtualPrice)
    : null;

  // FIXME: PriceTooltip is loading before CurvePrices get updated so returns undefined
  const displayCurve = theme.name !== 'ropsten' && bean3crvPrice !== undefined ?
    <>
      <br />
      Curve Bean Price: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{`$${bean3crvPrice.multipliedBy(curveVirtualPrice).toFixed(4)}`}
      <br />
      &nbsp;&nbsp;{`Liquidity: $${displayBN(beanCurveLiqValue)}`}
    </>
    : null;

  const currentBeanPrice = beanPrice && beanPrice.isGreaterThan(0) && (
    <FormatTooltip
      placement="right"
      title={
        <>
          {`Uniswap Bean Price: $${beanPrice.toFixed(4)}`}
          <br />
          &nbsp;&nbsp;{`Liquidity: $${displayBN(beanUniLiqValue)}`}
          {displayCurve}
        </>
      }
    >
      <Box style={priceStyle}>
        {`$${beanPrice.toFixed(4)}`}
      </Box>
    </FormatTooltip>
  );

  return (<>{currentBeanPrice}</>);
}
