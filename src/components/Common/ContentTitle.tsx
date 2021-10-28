import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { TitleLabel } from './index';
import { theme } from '../../constants';

export default function ContentTitle(props) {
    const classes = makeStyles({
        appSection: {
          padding: props.padding,
        },
        sectionTitle: {
          marginTop: props.marginTop,
          width: props.width,
        },
    })();
    return (
      <Box className={classes.sectionTitle}>
        <TitleLabel style={{ color: theme.backgroundText }} size={props.size} textTransform={props.textTransform}>
          {props.title}
        </TitleLabel>
      </Box>
    );
}
ContentTitle.defaultProps = {
    marginTop: '20px',
    width: '100%',
};
