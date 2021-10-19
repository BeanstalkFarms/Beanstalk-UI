import React from 'react';
import { ContentSection, Grid, HeaderLabel } from '../Common';
import TradeModule from './TradeModule';
import LastCrossTimer from './LastCrossTimer';

export default function Trade(props) {
  const { innerWidth: width } = window;

  return (
    <ContentSection id="trade" title="Trade">
      <Grid container item xs={12} spacing={3} justifyContent="center">
        <Grid
          className="section-description"
          item
          xs={12}
          sm={12}
          style={
            width > 700
              ? { maxWidth: '500px', margin: '20px 0', padding: '12px' }
              : {
                  maxWidth: '400px',
                  width: width - 154,
                  margin: '20px 0',
                  padding: '12px',
                  midWidth: width - 104,
                }
          }
        >
          Anyone can buy and sell Beans on Uniswap directly through the
          bean.money website. To buy and deposit or buy and sow in a single
          transaction from ETH, use the Silo and Field modules, respectively.
        </Grid>
      </Grid>
      <Grid container item xs={12} sm={12} spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} style={{ maxWidth: '300px' }}>
          <HeaderLabel
            title="Current Bean Price"
            value={`$${props.beanPrice.toFixed(4)}`}
            description="This is the live Bean price on Uniswap."
          />
        </Grid>
        <Grid item xs={12} sm={6} style={{ maxWidth: '300px' }}>
          <LastCrossTimer lastCross={props.lastCross} />
        </Grid>
      </Grid>

      <Grid
        item
        xs={10}
        sm={8}
        style={{ maxWidth: '500px', minHeight: '545px' }}
      >
        <TradeModule {...props} />
      </Grid>
    </ContentSection>
  );
}
