import React from 'react';
import useTimeTabState from '~/hooks/app/useTimeTabState';
import useUnfertilizedSprouts from '~/hooks/beanstalk/useUnfertilizedSprouts';

const FertilizerDebt: React.FC<{}> = () => {
  const timetabParams = useTimeTabState();
  useUnfertilizedSprouts(timetabParams[0][1]);
  return <div>Fertilizer</div>;
};

export default FertilizerDebt;
