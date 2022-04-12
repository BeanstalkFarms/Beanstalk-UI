import React from 'react';
import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { theme } from 'constants/index';

const useStyles = makeStyles(() => ({
  sectionTitle: {
    marginTop: '20px',
    marginBottom: '20px', // HOTFIX
    //
    fontFamily: 'Futura-PT-Book',
    fontSize: '24px',
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
      {title}
    </Box>
  );
};

export default ContentTitle;
