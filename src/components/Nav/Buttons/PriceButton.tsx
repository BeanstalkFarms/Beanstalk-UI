import React from 'react';
import {
  ButtonProps,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import usePools from 'hooks/usePools';
import { displayBN } from 'util/Tokens';
import { CHAIN_INFO } from 'constants/chains';
import useChainId from 'hooks/useChain';
import PoolCard from 'components/Silo/PoolCard';
import { NEW_BN, ZERO_BN } from 'constants/index';
import BeanProgressIcon from 'components/Common/BeanProgressIcon';
import useSeason from 'hooks/useSeason';
import FolderMenu from '../FolderMenu';

// ------------------------------------------------------------

const PriceButton: React.FC<ButtonProps> = ({ ...props }) => {
  // Data
  const pools = usePools();
  const chainId = useChainId();
  const season = useSeason();
  const beanPrice = useSelector<AppState, AppState['_bean']['token']['price']>(
    (state) => state._bean.token.price
  );
  const beanPools = useSelector<AppState, AppState['_bean']['pools']>(
    (state) => state._bean.pools
  );

  // Theme
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isTiny   = useMediaQuery('(max-width:350px)');

  // Content
  const isLoading = beanPrice.eq(NEW_BN);
  const startIcon = isTiny ? undefined : (
    <BeanProgressIcon size={25} enabled={isLoading} variant="indeterminate" />
  );
  const poolsContent = Object.values(pools).map((pool, index) => (
    <PoolCard
      key={`${pool.address}-${index}`}
      pool={pool}
      poolState={beanPools[pool.address]}
      ButtonProps={{
        href: `${CHAIN_INFO[chainId]?.explorer}/address/${pool.address}`,
        target: '_blank',
        rel: 'noreferrer',
      }}
    />
  ));

  return (
    <FolderMenu
      startIcon={startIcon}
      buttonContent={
        <>${(isLoading ? 0.0 : beanPrice).toFixed(isMobile ? 2 : 4)}</>
      }
      drawerContent={
        <Stack sx={{ p: 2 }} gap={1}>
          <Typography variant="h4">
            Pools — Season {displayBN(season || ZERO_BN)}
          </Typography>
          <Stack gap={1}>{poolsContent}</Stack>
        </Stack>
      }
      popoverContent={<Stack gap={1}>{poolsContent}</Stack>}
      {...props}
    />
  );
};

export default PriceButton;
