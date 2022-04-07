import React from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
  leftTransactionStyle: {
    display: 'inline-block',
    fontFamily: 'Futura-PT-Book',
    textAlign: 'left',
    width: '50%',
  },
  rightTransactionStyle: {
    display: 'inline-block',
    fontFamily: 'Futura-PT-Book',
    fontSize: 'calc(9px + 0.5vmin)',
    textAlign: 'right',
    width: '50%',
  },
  transactionStyle: {
    border: '1px solid black' as const,
    borderRadius: '15px',
    color: 'black',
    fontSize: 'calc(9px + 0.5vmin)',
    marginBottom: '-4px',
    marginLeft: '5%',
    padding: '12px',
    width: '90%',
  }
});

export default function SwapTransactionDetailsModule(props) {
  const classes = useStyles();

  const rows = Object.keys(props.fields).reduce((r, key, i) => {
    r.push(
      <span key={`${i}-left`} className={classes.leftTransactionStyle}>
        {key}
      </span>
    );
    r.push(
      <span key={`${i}-right`} className={classes.rightTransactionStyle}>
        {props.fields[key]}
      </span>
    );
    return r;
  }, []);

  return <p className={classes.transactionStyle}>{rows}</p>;
}
