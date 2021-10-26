import React from 'react';
import {
  Box,
  Button,
  InputAdornment,
  TextField,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import CancelIcon from '@material-ui/icons/Cancel';

export default function AddressInputField(props) {
  const classes = makeStyles(() => ({
    inputText: {
      fontFamily: 'Lucida Console',
      fontSize: 'calc(15px + 1vmin)',
      fontWeight: '400',
    },
  }))();

  const smallLabels = {
    display: 'inline-block',
    fontFamily: 'Futura-PT-Book',
    fontSize: 'calc(9px + 0.7vmin)',
    marginLeft: '13px',
    marginTop: props.marginTop,
    textAlign: 'left' as const,
    textTransform: 'uppercase' as const,
    width: 'calc(100% - 13px)',
  };

  let endAdornment;
  let startAdornment;
  if (props.snapped) {
    endAdornment = (
      <InputAdornment position="end">
        <Button onClick={props.handleClear}>
          <ClearIcon />
        </Button>
      </InputAdornment>
    );
    startAdornment =
      props.isValidAddress === true ? (
        <InputAdornment position="start">
          <CheckIcon style={{ color: 'green' }} />
        </InputAdornment>
      ) : (
        <InputAdornment position="start">
          <CancelIcon style={{ color: 'red' }} />
        </InputAdornment>
      );
  }

  return (
    <Box>
      <Box style={smallLabels}>Recipient Address</Box>
      <TextField
        className="TextField-rounded"
        placeholder="0x00000"
        variant="outlined"
        size="medium"
        type="text"
        disabled={props.handleChange === undefined}
        value={props.address}
        onChange={props.handleChange}
        onKeyDown={(e) => false && e.preventDefault()}
        fullWidth
        InputProps={{
          inputProps: {
            maxLength: 42,
          },
          classes: {
            input: classes.inputText,
          },
          endAdornment,
          startAdornment,
        }}
      />
    </Box>
  );
}

AddressInputField.defaultProps = {
  marginTop: '8px',
};
