import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import { FarmToMode } from 'lib/Beanstalk/Farm';
import AddressIcon from '../AddressIcon';
import PillSelectField from './PillSelectField';
import { IconSize } from '../../App/muiTheme';

const DestinationField : React.FC<{
  name: string;
}> = ({
  name
}) => {
  const options = useMemo(() => ([
    {
      title: 'Farm Balance',
      description: 'Transfer assets to your internal Beanstalk balance to be used in other transactions.',
      pill: <Typography variant="body1">🚜 Farm Balance</Typography>,
      icon: '🚜',
      value: FarmToMode.INTERNAL,
    },
    {
      title: 'Wallet',
      description: 'Transfer assets to your wallet.',
      pill: <><AddressIcon size={14} /><Typography variant="body1">Wallet</Typography></>,
      icon: <AddressIcon size={IconSize.small} />,
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
