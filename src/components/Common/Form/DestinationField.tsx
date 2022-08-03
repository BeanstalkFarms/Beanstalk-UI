import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import { FarmToMode } from 'lib/Beanstalk/Farm';
import AddressIcon from '../AddressIcon';
import PillSelectField, { PillSelectFieldProps } from './PillSelectField';
import { IconSize } from '../../App/muiTheme';

const DestinationField : React.FC<Partial<PillSelectFieldProps> & {
  walletDesc?: string;
  farmDesc?:   string;
  name:        string; // force required
}> = ({
  walletDesc = 'Send assets to your wallet.',
  farmDesc = 'Send assets to your internal balance within Beanstalk.',
  ...props
}) => {
  const options = useMemo(() => ([
    {
      title: 'Circulating Balance',
      description: walletDesc,
      pill: <><AddressIcon size={IconSize.xs} /><Typography variant="body1">Wallet</Typography></>,
      icon: <AddressIcon size={IconSize.small} width={IconSize.small} height={IconSize.small} />,
      value: FarmToMode.EXTERNAL,
    },
    {
      title: 'Farm Balance',
      description: farmDesc,
      pill: <Typography variant="body1">🚜 Farm Balance</Typography>,
      icon: '🚜',
      value: FarmToMode.INTERNAL,
    },
    ...(props.options || [])
  ]), [farmDesc, props.options, walletDesc]);
  return (
    <PillSelectField
      label="Destination" // override this label if provided in ...props
      {...props}          //
      options={options}   // always deterministically set options
    />
  );
};

export default DestinationField;
