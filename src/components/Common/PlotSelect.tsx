import React from 'react';
import { Stack, Typography, Card, ListItem, ListItemButton, ListItemIcon, ListItemText, List } from '@mui/material';
import BigNumber from 'bignumber.js';
import { makeStyles } from '@mui/styles';
import { BeanstalkPalette, FontSize, IconSize } from '../App/muiTheme';
import { displayBN } from '../../util';
import podIcon from '../../img/beanstalk/pod-icon.svg';
import { PlotMap } from '../../state/farmer/field';
import { ZERO_BN } from '../../constants';

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
}

const PlotSelect: React.FC<PlotSelectProps> = ({ plots, harvestableIndex, handlePlotSelect }) => {
  const classes = useStyles();
  if (plots === null) {
    return null;
  }
  return (
    <>
      <List sx={{ p: 0 }}>
        <Stack gap={1}>
          {Object.keys(plots).map((index) => (
            <ListItem
              key={index}
              color="primary"
              // selected={newSelection.has(_token)}
              disablePadding
              secondaryAction={(
                <Typography variant="bodyLarge">
                  {displayBN(new BigNumber(plots[index]))}
                </Typography>
              )}
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
                <ListItemIcon sx={{ pr: 1 }}>
                  <img src={podIcon} alt="" className={classes.tokenLogo} />
                </ListItemIcon>
                <ListItemText
                  primary="PODS"
                  secondary={`Place in Line: ${displayBN(new BigNumber(index).minus(harvestableIndex))}`}
                  sx={{ my: 0 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </Stack>
      </List>
    </>
  );
};

export default PlotSelect;
