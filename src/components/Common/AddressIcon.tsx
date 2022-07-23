import React from 'react';
import { BEANSTALK_ADDRESSES } from 'constants/index';
import { BoxProps } from '@mui/material';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import useAccount from 'hooks/ledger/useAccount';

const FALLBACK_ADDRESS = BEANSTALK_ADDRESSES[1];

const AddressIcon : React.FC<BoxProps & {
  size?: number;
  address?: string;
}> = ({
  size = 25,
  address,
}) => {
  const account = useAccount();
  const addr = address || account || FALLBACK_ADDRESS; // FIXME naming
  return (
    <Jazzicon
      diameter={size}
      seed={jsNumberForAddress(addr)}
    />
  );
};

export default AddressIcon;
