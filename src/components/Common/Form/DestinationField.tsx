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
      title: 'Farm Balance',
      description: 'Transfer assets to your internal Beanstalk balance to be used in other transactions.',
      pill: <><Typography>🚜</Typography><Typography>Farm Balance</Typography></>,
      icon: '🚜',
      value: FarmToMode.INTERNAL,
    },
    {
      title: 'Wallet',
      description: 'Transfer assets to your wallet.',
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
