import React from 'react';
import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

import { ContentTitle } from 'components/Common';

const useStyles = makeStyles(() => ({
  page: {
    width: '100%',
    textAlign: 'center',
    paddingBottom: 80,
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
