import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { theme } from 'constants/index';
import { TitleLabel } from './index';

export default function ContentTitle({
  marginTop,
  padding,
  size,
  title,
  textTransform,
  width,
}) {
  const classes = makeStyles({
    appSection: {
      padding: padding,
    },
    sectionTitle: {
      marginTop: marginTop,
      width: width,
    },
  })();

  return (
    <Box className={classes.sectionTitle}>
      <TitleLabel
        style={{ color: theme.backgroundText }}
        size={size}
        textTransform={textTransform}
      >
        {title}
      </TitleLabel>
    </Box>
  );
}
ContentTitle.defaultProps = {
  marginTop: '20px',
  width: '100%',
};
