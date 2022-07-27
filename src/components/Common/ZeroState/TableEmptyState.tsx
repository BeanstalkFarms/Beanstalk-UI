import React from 'react';
import { Stack, StackProps, Typography } from '@mui/material';
import useAccount from 'hooks/ledger/useAccount';
import WalletButton from '../Connection/WalletButton';

/**
 * Similar to CardEmptyState, but
 * takes into account authentication
 * status.
 * */
const TableEmptyState: React.FC<{
  /** Card title */
  title?: string;
  /** Loading / connection state */
  state?: 'disconnected' | 'loading' | 'ready';
} & StackProps> = ({
  title,
  state,
  height,
  children,
}) => {
  const account = useAccount();
  let content;
  if (!account) {
    content = (
      <WalletButton variant="outlined" color="primary" size="large" />
    );
  } else {
    content = (
      <>
        {title && <Typography variant="body1" color="gray">{title}</Typography>}
        {children}
      </>
    );
  }
  return (
    <Stack
      sx={{
        height: height || '100%',
        // place this over the virtual scroller
        zIndex: 10,
        position: 'relative',
      }}
      alignItems="center"
      justifyContent="center"
      gap={1}
    >
      {content}
      {/* <Typography variant="body1" color="gray">
        {state === 'disconnected'
          ? `Connect a wallet to view ${title}`
          : state === 'loading'
            ? 'Loading...'
            : `No ${title}`}
      </Typography> */}
    </Stack>
  );
};

export default TableEmptyState;
