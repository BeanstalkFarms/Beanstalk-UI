import React from 'react';
import { useAccount } from 'wagmi';
import { BEANSTALK_ADDRESSES } from 'constants/index';
import { BoxProps } from '@mui/material';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

const FALLBACK_ADDRESS = BEANSTALK_ADDRESSES[1];

const AddressIcon : React.FC<BoxProps & {
  size?: number;
  address?: string;
}> = ({
  size = 25,
  address,
  sx,
  ...props
}) => {
  const { data: account } = useAccount();
  const addr = address || account?.address || FALLBACK_ADDRESS;
  return (
    <Jazzicon
      diameter={size}
      seed={jsNumberForAddress(addr)}
    />
  );
};

export default AddressIcon;
