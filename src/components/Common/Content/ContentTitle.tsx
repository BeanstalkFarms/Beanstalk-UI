import React from 'react';
import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { theme } from 'constants/index';

const useStyles = makeStyles(() => ({
  // Title
  appSection: {
    // padding: padding,
  },
  sectionTitle: {
    marginTop: '20px',
    marginBottom: 10, // HOTFIX
    width: '100%',
  },
  sectionTitleText: {
    color: theme.backgroundText,
  },

  // Label
  label: {
    borderRadius: '15px',
    fontFamily: 'Futura-PT-Book',
    fontSize: '24px',
    margin: '0',
    padding: '5px',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    color: theme.backgroundText,
  },
}));

type ContentTitleProps = {
  title: string;
}

const ContentTitle : React.FC<ContentTitleProps> = ({ title }) => {
  const classes = useStyles();
  return (
    <Box className={classes.sectionTitle}>
      <Box className={classes.label}>
        {title}
      </Box>
    </Box>
  );
};

export default ContentTitle;
