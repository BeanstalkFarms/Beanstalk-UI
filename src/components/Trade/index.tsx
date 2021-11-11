import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { displayFullBN } from '../../util';
import { ContentSection, Grid, HeaderLabel } from '../Common';
import TradeModule from './TradeModule';
import LastCrossTimer from './LastCrossTimer';

export default function Trade() {
  const { beanPrice } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  const { lastCross } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );
  const description =
    'Anyone can buy and sell Beans on Uniswap directly through the bean.money website. To buy and deposit or buy and sow in a single transaction from ETH, use the Silo and Field modules, respectively.';

  return (
    <ContentSection id="trade" title="Trade" description={description}>
      <Grid container item xs={12} sm={12} spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} style={{ maxWidth: '300px' }}>
          <HeaderLabel
            description="This is the live Bean price on Uniswap."
            balanceDescription={`$${displayFullBN(beanPrice)}`}
            title="Current Bean Price"
            value={`$${beanPrice.toFixed(4)}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} style={{ maxWidth: '300px' }}>
          <LastCrossTimer lastCross={lastCross} />
        </Grid>
      </Grid>

      <Grid
        item
        xs={10}
        sm={8}
        style={{ maxWidth: '500px', minHeight: '545px' }}
      >
        <TradeModule />
      </Grid>
    </ContentSection>
  );
}
