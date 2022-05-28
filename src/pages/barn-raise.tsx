import React from 'react';
import { Container, Stack } from '@mui/material';
import PageHeader from 'components/v2/Common/PageHeader';
import { useSelector } from 'react-redux';
import useHumidity, { INITIAL_HUMIDITY } from 'hooks/useHumidity';
import { AppState } from 'state';
import PurchaseForm from 'components/v2/BarnRaise/PurchaseForm';
import RemainingFertilizer from 'components/v2/BarnRaise/RemainingFertilizer';
import MyFertilizer from 'components/v2/BarnRaise/MyFertilizer';

const WrappedRemainingFertilizer = () => {
  const [humidity, nextDecreaseAmount] = useHumidity();
  const fertilizer = useSelector<AppState, AppState['_beanstalk']['fertilizer']>((state) => state._beanstalk.fertilizer);
  const nextDecreaseDuration = useSelector<AppState, AppState['_beanstalk']['sun']['sunrise']['remaining']>(
    (state) => state._beanstalk.sun.sunrise.remaining
  );
  return (
    <RemainingFertilizer
      remaining={fertilizer.remaining}
      nextDecreaseAmount={nextDecreaseAmount}
      // FIXME:
      //  Below "in early July" is hardcoded.
      //  Also hardcoded in getNextExpectedSunrise().
      nextDecreaseTimeString={humidity.eq(INITIAL_HUMIDITY) ? 'in early July' : `in ${nextDecreaseDuration.toFormat('mm:ss')}`}
      humidity={humidity}
    />
  );
};

const BarnRaisePage: React.FC = () => (
  <Container maxWidth="md">
    <Stack gap={2}>
      <PageHeader
        title="The Barn Raise"
        purpose="Rebuilding Beanstalk"
        description="Earn yield through purchasing & activating Fertilizer, the Barn Raise token"
      />
      {/* Section 1: Fertilizer Remaining */}
      <WrappedRemainingFertilizer />
      {/* Section 2: Purchase Fertilizer */}
      <PurchaseForm />
      {/* Section 3: My Fertilizer */}
      <MyFertilizer />
    </Stack>
  </Container>
);

export default BarnRaisePage;
