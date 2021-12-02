import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { displayFullBN } from 'util/index';
import {
  ContentSection,
  Grid,
  HeaderLabel,
  tradeStrings,
} from 'components/Common';
import TradeModule from './TradeModule';
import LastCrossTimer from './LastCrossTimer';

export default function Trade() {
  const { beanPrice, ethPrices } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  const { lastCross } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  return (
    <ContentSection
      id="trade"
      title="Trade"
      description={tradeStrings.tradeDescription}
    >
      <Grid container item xs={12} sm={12} spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} style={{ maxWidth: '300px' }}>
          <HeaderLabel
            description={tradeStrings.price}
            balanceDescription={`$${displayFullBN(beanPrice)}`}
            title="Current Bean Price"
            value={`$${beanPrice.toFixed(4)}`}
          />
          <Grid item xs={12} sm={6} style={{ maxWidth: '300px', paddingTop: '20px' }}>
            <HeaderLabel
              description={tradeStrings.price}
              title="Current ETH Price"
              value={`$${ethPrices?.ethPrice}`}
            />
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6} style={{ maxWidth: '300px' }}>
          <LastCrossTimer lastCross={lastCross} />
          <Grid item xs={12} sm={6} style={{ maxWidth: '300px', paddingTop: '20px' }}>
            <HeaderLabel
              description={tradeStrings.price}
              title="Gas Price"
              value={`⚡️: ${ethPrices?.fast} 🚶: ${ethPrices?.propose} 🐢: ${ethPrices?.safe}`}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid
        item
        xs={10}
        sm={8}
        style={{ maxWidth: '500px', minHeight: '645px' }}
      >
        <TradeModule />
      </Grid>
    </ContentSection>
  );
}
