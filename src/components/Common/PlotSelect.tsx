import React, { useMemo } from 'react';
import { Stack, Typography, ListItem, ListItemButton, ListItemIcon, ListItemText, List, Box } from '@mui/material';
import BigNumber from 'bignumber.js';
import { makeStyles } from '@mui/styles';
import { BEAN } from 'constants/tokens';
import useFarmerListings from 'hooks/redux/useFarmerListings';
import { BeanstalkPalette, FontSize, IconSize } from '../App/muiTheme';
import { displayBN, displayFullBN, toStringBaseUnitBN } from '../../util';
import podIcon from '../../img/beanstalk/pod-icon.svg';
import { PlotMap } from '../../state/farmer/field';

const useStyles = makeStyles(() => ({
  tokenIcon: {
    minWidth: '18px',
    width: '18px',
    height: '18px',
    marginRight: '5px'
  },
  tokenName: {
    color: '#3B3B3B',
    fontSize: '20px'
  },
  tokenLogo: {
    width: IconSize.large,
    height: IconSize.large,
  }
}));

export interface PlotSelectProps {
  /** A farmer's plots */
  plots: PlotMap<BigNumber> | null;
  /** The beanstalk harvestable index */
  harvestableIndex: BigNumber;
  /** Custom function to set the selected plot index */
  handlePlotSelect: any;
  /** index of the selected plot */
  selected?: string | null;
}

const PlotSelect: React.FC<PlotSelectProps> = ({
  plots,
  harvestableIndex,
  handlePlotSelect,
  selected
}) => {
  const classes = useStyles();
  const farmerListings = useFarmerListings();
  const orderedPlotKeys = useMemo(() => {
    if (!plots) return null;
    /// float sorting is good enough here
    return Object.keys(plots).sort((a, b) => parseFloat(a) - parseFloat(b));
  }, [plots]);
  if (!plots || !orderedPlotKeys) return null;
  
  ///
  let numAlreadyListed = 0;
  const items = orderedPlotKeys.map((index) => {
    const id = toStringBaseUnitBN(index, BEAN[1].decimals);
    const listing = farmerListings[id];
    if (listing) numAlreadyListed += 1;
    return (
      <ListItem
        key={index}
        color="primary"
        selected={selected ? selected === index : undefined}
        disablePadding
        onClick={() => handlePlotSelect(index)}
        sx={{
          // ListItem is used elsewhere so we define here
          // instead of in muiTheme.ts
          '& .MuiListItemText-primary': {
            fontSize: FontSize['1xl'],
            lineHeight: '1.875rem'
          },
          '& .MuiListItemText-secondary': {
            fontSize: FontSize.base,
            lineHeight: '1.25rem',
            color: BeanstalkPalette.lightishGrey
          },
        }}
      >
        <ListItemButton disableRipple>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
            <Stack direction="row" justifyContent="center">
              <ListItemIcon sx={{ pr: 1 }}>
                <img src={podIcon} alt="" className={classes.tokenLogo} />
              </ListItemIcon>
              <ListItemText
                primary="PODS"
                secondary={(
                  <>
                    Place in Line: {displayBN(new BigNumber(index).minus(harvestableIndex))}{listing ? <>&nbsp;&middot; Currently listed</> : null}
                  </>
                )}
                secondaryTypographyProps={{
                  // sx: {
                  //   color: '#333333 !important'
                  // }
                }}
                sx={{ my: 0 }}
              />
            </Stack>
            {plots[index] ? (
              <Typography variant="bodyLarge">
                {displayFullBN(plots[index], 0)}
              </Typography>
              ) : null}
          </Stack>
        </ListItemButton>
      </ListItem>
    );
  });
  
  return (
    <>
      {numAlreadyListed > 0 ? (
        <Box px={1}>
          <Typography color="text.secondary" fontSize="bodySmall">
            {/* * Currently listed on the Market. */}
            {/* FIXME: contextual message */}
          </Typography>
        </Box>
      ) : null}
      <List sx={{ p: 0 }}>
        {items}
      </List>
    </>
  );
};

export default PlotSelect;
