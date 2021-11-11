import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { TitleLabel } from './index';
import { theme } from '../../constants';

export default function ContentTitle({ padding, marginTop, width, title, size, textTransform, onClick }) {
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
    <Box onClick={onClick} className={classes.sectionTitle}>
      <TitleLabel style={{ color: theme.backgroundText, cursor: 'pointer' }} size={size} textTransform={textTransform}>
        {title}
      </TitleLabel>
    </Box>
  );
}
ContentTitle.defaultProps = {
  marginTop: '20px',
  width: '100%',
};
