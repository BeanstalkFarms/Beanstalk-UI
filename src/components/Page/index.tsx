import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

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
