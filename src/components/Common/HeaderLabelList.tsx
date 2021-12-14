import React from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { theme } from 'constants/index';
import { HeaderLabel } from './index';

export default function HeaderLabelList(props) {
  const classes = makeStyles(() => ({
    container: {
      backgroundColor: theme.secondary,
      borderRadius: '15px',
      boxShadow: props.container
        ? '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%),0px 1px 10px 0px rgb(0 0 0 / 12%)'
        : null,
      color: theme.accentText,
      display: 'flex',
      fontSize: '16px',
      padding: '8px',
      textTransform: 'none',
      width: props.width,
    },
  }))();

  return (
    <Grid container className={classes.container}>
      {props.title.filter((x) => x !== null).map((item, index) => (
        <Grid key={index} item xs={12}>
          <HeaderLabel
            balanceDescription={props.balanceDescription[index]}
            description={props.description[index]}
            title={props.title[index]}
            value={props.value[index]}
            container={false}
          />
        </Grid>
      ))}
    </Grid>
  );
}

HeaderLabelList.defaultProps = {
  container: true,
  width: '250px',
};
