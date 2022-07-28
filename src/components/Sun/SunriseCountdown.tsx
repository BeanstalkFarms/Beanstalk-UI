import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';

const SunriseCountdown : React.FC = () => {
  const remaining = useSelector<AppState, AppState['_beanstalk']['sun']['sunrise']['remaining']>((state) => state._beanstalk.sun.sunrise.remaining);

  return ( 
    <>in {remaining.toFormat('mm:ss')}`</>
  );
};

export default SunriseCountdown;
