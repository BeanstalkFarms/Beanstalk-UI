import React, { FC } from 'react';
import { Link, Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles({
  icon: {
    marginLeft: '6px',
    marginRight: '6px',
    marginTop: '25px'
  }
});

interface LogoLinkProps {
    link: string;
    children: any;
}

const LogoLink: FC<LogoLinkProps> = ({ link, children }) => {
  const classes = useStyles();

  return (
    <Grid item className={classes.icon}>
      <Link href={link} color="inherit" target="blank" underline="hover">
        {children}
      </Link>
    </Grid>
  );
};

export default LogoLink;
