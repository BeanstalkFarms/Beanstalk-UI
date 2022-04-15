import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  transactionStyle: {
    border: '1px solid black' as const,
    borderRadius: '15px',
    color: 'black',
    fontSize: 'calc(9px + 0.5vmin)',
    marginBottom: '5px',
    marginTop: '10px',
    padding: '12px',
    width: '100%',
  },
  rowStyle: {
    display: 'inline-block',
    fontFamily: 'Futura-PT-Book',
    textAlign: 'left',
    width: '100%',
  },
  buttonStyle: {
    fontFamily: 'Futura-PT-Book',
    fontSize: '13px',
    textTransform: 'none',
    width: '160px',
    textDecorationLine: 'underline',
  }
});

export default function TransactionDetailsModule({ fields }) {
  const classes = useStyles();
  const [showTx, setShowTx] = useState(false);

  const buttonText = showTx
    ? 'Hide Transaction Details'
    : 'Show Transaction Details';

  const showTxField = showTx ? (
    <Box className={classes.transactionStyle}>
      {Object.keys(fields).map((key, index) => (
        <Box key={`${key}`} className={classes.rowStyle}>
          {`${index + 1}. `}{fields[key]}
        </Box>
      ))}
    </Box>
  ) : null;

  return (
    <>
      <Button
        variant="text"
        onClick={() => setShowTx(!showTx)}
        className={classes.buttonStyle}
      >
        {buttonText}
      </Button>
      {showTxField}
    </>
  );
}
