import { FarmToMode } from 'lib/Beanstalk/Farm';

const TO_MODE = {
  [FarmToMode.INTERNAL]: 'Farm Balance',
  [FarmToMode.EXTERNAL]: 'Circulating Balance',
};

const copy = {
  TO_MODE
};

export default copy;
