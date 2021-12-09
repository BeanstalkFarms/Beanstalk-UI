import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { displayFullBN } from 'util/index';
import { theme } from 'constants/index';
import {
  ContentDropdown,
  ContentSection,
  Grid,
  HeaderLabelList,
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

  const headerLabelStyle = {
    maxWidth: '300px',
    color: theme.text,
  };

  const [lcTitle, lcValue, lcDescription, lcBalanceDescription] =
    LastCrossTimer(lastCross);

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
      <Grid container xs={12} justifyContent="center" style={headerLabelStyle}>
        <HeaderLabelList
          description={[
            tradeStrings.price,
            lcDescription,
          ]}
          balanceDescription={[
            `$${displayFullBN(beanPrice)}`,
            lcBalanceDescription,
          ]}
          title={[
            'Current Bean Price',
            lcTitle,
          ]}
          value={[
            `$${beanPrice.toFixed(4)}`,
            lcValue,
          ]}
        />
      </Grid>

      <TradeModule />
    </ContentSection>
  );
}
