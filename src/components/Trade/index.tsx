import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { displayFullBN } from 'util/index';
import {
  ContentSection,
  ContentDropdown,
  Grid,
  HeaderLabel,
  tradeStrings,
} from 'components/Common';
import TradeModule from './TradeModule';
import LastCrossTimer from './LastCrossTimer';

export default function Trade() {
  const { beanPrice } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  const { lastCross } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  return (
    <ContentSection
      id="trade"
      title="Trade"
    >
      <Grid container justifyContent="center" style={{ margin: '20px 0px' }}>
        <ContentDropdown
          description={tradeStrings.tradeDescription}
          descriptionTitle="How do I Trade?"
        />
      </Grid>
      <Grid container item xs={12} sm={12} spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} style={{ maxWidth: '300px' }}>
          <HeaderLabel
            description={tradeStrings.price}
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
        style={{ maxWidth: '500px', minHeight: '645px' }}
      >
        <TradeModule />
      </Grid>
    </ContentSection>
  );
}
