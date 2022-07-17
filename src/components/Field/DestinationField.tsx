import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import { FarmToMode } from 'lib/Beanstalk/Farm';
// import siloIcon from 'img/beanstalk/silo-icon.svg';
import AddressIcon from '../Common/AddressIcon';
import PillSelectField from '../Common/Form/PillSelectField';
import { IconSize } from '../App/muiTheme';

const DestinationField: React.FC<{
  name: string;
}> = ({ name }) => {
  const options = useMemo(
    () => [
      {
        title: 'Wallet',
        description: 'Transfer Harvestable Pods to your wallet as Beans.',
        pill: (
          <>
            <AddressIcon size={14} />
            <Typography variant="body1">Wallet</Typography>
          </>
        ),
        icon: (
          <AddressIcon
            size={IconSize.small}
            width={IconSize.small}
            height={IconSize.small}
          />
        ),
        value: FarmToMode.EXTERNAL,
      },
      {
        title: 'Farm Balance',
        description:
          'Transfer Harvestable Pods to your internal Beanstalk balance as Beans.',
        pill: <Typography variant="body1">🚜 Farm Balance</Typography>,
        icon: '🚜',
        value: FarmToMode.INTERNAL,
      },
      // {
      //   title: 'The Silo ',
      //   description: 'Transfer Harvestable Pods to the Silo as Deposited Beans to earn yield.',
      //   pill: <Typography variant="body1">🚜 The Silo</Typography>,
      //   icon: <img src={siloIcon} alt="" height={IconSize.small} />,
      //   value: FarmToMode.DEPOSIT,
      // }
    ],
    []
  );
  return <PillSelectField name={name} label="Destination" options={options} />;
};

export default DestinationField;
