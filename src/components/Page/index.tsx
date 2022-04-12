import React from 'react';
import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

import { ContentTitle } from 'components/Common';

const useStyles = makeStyles(() => ({
  page: {
    width: '100%',
    // FIXME: remove this textAlign dependency
    // Disabling this breaks a ton of stuff:
    // - "Sow" button moves to left side
    // - "Currently No Soil" moves left
    // - ContentTitle moves left
    textAlign: 'center',
    // Provides room to scroll past footer
    paddingBottom: 140, 
    // FIXME: this should be defined elsewhere
    fontFamily: 'Futura-PT-Book',
  }
}));

type PageProps = {
  title?: string;
}

const Page : React.FC<PageProps> = (props) => {
  const classes = useStyles();
  return (
    <Box className={classes.page}>
      {props.title ? (
        <ContentTitle title={props.title} />
      ) : null}
      {props.children}
    </Box>
  );
};

export default Page;
