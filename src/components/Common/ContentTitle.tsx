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
    sectionTitleText: {
      color: theme.backgroundText,
    },
  })();

  return (
    <Box className={classes.sectionTitle}>
      <TitleLabel
        size={size}
        textTransform={textTransform}
        className={classes.sectionTitleText}
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
