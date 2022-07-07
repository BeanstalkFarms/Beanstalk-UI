import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import { FarmToMode } from 'lib/Beanstalk/Farm';
import AddressIcon from '../AddressIcon';
import PillSelectField from './PillSelectField';

const DestinationField : React.FC<{
  name: string;
}> = ({
  name
}) => {
  const options = useMemo(() => ([
    {
      title: 'My Beanstalk Farm Balance',
      description: 'Receive to an internal balance within Beanstalk. You can use this internal balance within the Beanstalk protocol.',
      pill: <><Typography>🚜</Typography><Typography>Farm Balance</Typography></>,
      icon: '🚜',
      value: FarmToMode.INTERNAL,
    },
    {
      title: 'My Wallet',
      description: 'Receive your Claimable balance from Beanstalk directly to your wallet.',
      pill: <><AddressIcon size={16} /><Typography>Wallet</Typography></>,
      icon: <AddressIcon size={36} />,
      value: FarmToMode.EXTERNAL,
    }]
  ), []);
  return (
    <PillSelectField
      name={name}
      label="Destination"
      options={options}
    />
  );
};

export default DestinationField;
