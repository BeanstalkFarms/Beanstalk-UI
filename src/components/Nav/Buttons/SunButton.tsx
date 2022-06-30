import React from 'react';
import { ButtonProps, Stack, Typography, useMediaQuery } from '@mui/material';
import { NEW_BN } from 'constants/index';
import FolderMenu from '../FolderMenu';
import useSeason from 'hooks/useSeason';
import drySeasonIcon from 'img/beanstalk/sun/dry-season.svg';
import rainySeasonIcon from 'img/beanstalk/sun/rainy-season.svg';
import { useSelector } from 'react-redux';
import { AppState } from 'state';

// ------------------------------------------------------------

const PriceButton: React.FC<ButtonProps> = ({ ...props }) => {
  // Data
  // const pools     = usePools();
  // const chainId   = useChainId();
  const season    = useSeason();
  const beanPrice = useSelector<AppState, AppState['_bean']['token']['price']>(
    (state) => state._bean.token.price
  );
  // const beanPools = useSelector<AppState, AppState['_bean']['pools']>(
  //   (state) => state._bean.pools
  // );
  
  // Theme
  const isTiny    = useMediaQuery('(max-width:350px)');
  
  // Content
  const isLoading = season.eq(NEW_BN);
  const startIcon = isTiny ? undefined : (
    <img src={beanPrice.gt(1) ? rainySeasonIcon : drySeasonIcon} style={{ width: 25, height: 25 }} alt="Dry Season" />
  );
  const content = (
    <div>
      Content
    </div>
  )

  return (
    <FolderMenu
      startIcon={startIcon}
      buttonContent={
        <>
          {isLoading ? '0000' : season.toFixed()}
        </>
      }
      drawerContent={
        <Stack sx={{ p: 2 }} gap={2}>
          <Typography variant="h2">
            Title (only on mobile)
          </Typography>
          <Stack gap={1}>
            {content}
          </Stack>
        </Stack>
      }
      popoverContent={
        <Stack gap={1}>
          {content}
        </Stack>
      }
      {...props}
    />
  );
};

export default PriceButton;
