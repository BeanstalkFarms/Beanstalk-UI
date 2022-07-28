import React from 'react';
import { Stack, StackProps, Typography } from '@mui/material';
import useAccount from 'hooks/ledger/useAccount';
import WalletButton from '../Connection/WalletButton';

/**
 * Similar to EmptyState, but
 * takes into account authentication
 * status.
 * */
const AuthEmptyState: React.FC<{
  /** Card title */
  title?: string;
  /**
   * Overrides default message
   * when wallet is connected.
   */
  message?: string;
  /** Loading / connection state */
  state?: 'disconnected' | 'loading' | 'ready';
  /**
   * Choose between a Connect Button or
   * a message when a wallet is not connected.
   * Defaults to Button.
   * */
  option?: 'button' | 'message'
} & StackProps> = ({
  title,
  message,
  state,
  option,
  children,
}) => {
  const account = useAccount();
  let content;
  if (!account) {
    content = option !== undefined && option === 'message'
      ? (<Typography variant="body1" color="gray">Connect your wallet to see table.</Typography>)
      : (<WalletButton variant="contained" color="primary" size="large" />);
  } else {
    content = (
      <>
        {title && !message && <Typography variant="body1" color="gray">Your {title} will appear here.</Typography>}
        {message && <Typography variant="body1" color="gray">{message}</Typography>}
        {children}
      </>
    );
  }
  return (
    <Stack
      sx={{
        height: '100%',
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

export default AuthEmptyState;
