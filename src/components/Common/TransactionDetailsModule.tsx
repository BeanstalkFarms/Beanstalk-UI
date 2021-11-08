import React, { useState } from 'react';
import { Box, Button } from '@material-ui/core';

export default function TransactionDetailsModule(props) {
  const [showTx, setShowTx] = useState(false);

  const transactionStyle = {
    border: '1px solid black' as const,
    borderRadius: '15px',
    color: 'black',
    fontSize: 'calc(9px + 0.5vmin)',
    marginBottom: '5px',
    marginTop: '10px',
    marginLeft: '5%',
    padding: '12px',
    width: '90%',
  };
  const rowStyle = {
    display: 'inline-block',
    fontFamily: 'Futura-PT-Book',
    textAlign: 'left',
    width: '100%',
  };
  const buttonStyle = {
    fontFamily: 'Futura-PT-Book',
    fontSize: '13px',
    textTransform: 'none',
    width: '160px',
    textDecorationLine: 'underline',
  };

  const buttonText = showTx
    ? 'Hide Transaction Details'
    : 'Show Transaction Details';

  const showTxField = showTx ? (
    <Box style={transactionStyle}>
      {Object.keys(props.fields).map((key) => (
        <Box key={`${key}`} style={rowStyle}>
          {props.fields[key]}
        </Box>
      ))}
    </Box>
  ) : null;

  return (
    <>
      <Button
        variant="text"
        onClick={() => setShowTx(!showTx)}
        style={buttonStyle}
      >
        {buttonText}
      </Button>
      {showTxField}
    </>
  );
}
