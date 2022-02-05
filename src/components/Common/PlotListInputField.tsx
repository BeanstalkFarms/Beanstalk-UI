import React from 'react';
import BigNumber from 'bignumber.js';
import {
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  Select,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { displayBN } from 'util/index';

export default function ListInputField(props) {
  const classes = makeStyles({
    inputText: {
      borderRadius: '25px',
      fontSize: 'calc(6px + 1.5vmin)',
      fontFamily: 'Futura-PT-Book',
      fontWeight: 400,
    },
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      width: 'auto',
    },
    formControl: {
      minWidth: 120,
      width: 'calc(100%)',
      marginRight: '13px',
      marginBottom: props.marginBottom,
    },
    smallLabels: {
      display: 'inline-block',
      fontFamily: 'Futura-PT-Book',
      fontSize: 'calc(9px + 0.7vmin)',
      marginLeft: '13px',
      textAlign: 'left' as const,
      textTransform: 'uppercase' as const,
      width: 'calc(100% - 13px)',
    },
  })();

  if (props.hidden) return null;
  const itemKeys = Object.keys(props.items);

  return (
    <Box style={{ margin: '8px 0', ...props.style }}>
      <Box className={classes.smallLabels}>
        {props.label}
      </Box>
      <FormControl
        variant="outlined"
        size="medium"
        type="number"
        className={classes.formControl}
      >
        <InputLabel>{props.title}</InputLabel>
        <Select
          native
          className={classes.inputText}
          disabled={itemKeys.length === 0}
          onChange={props.handleChange}
          input={
            <OutlinedInput
              name="Selected Plot"
              labelWidth={props.labelWidth}
              id="outlined-age-native-simple"
              style={{ height: 'calc(56px + 1vmin)' }}
            />
          }
        >
          {itemKeys.length > 0 ? (
            <option value="default">Select Plot to {props.type}</option>
          ) : (
            <option>You have no Plots {props.descriptor} to {props.type}</option>
          )}
          {itemKeys.length > 0
            ? itemKeys
                .sort((a, b) => a - b)
                .map((index) => (
                  <option key={index} value={index} index={index.toString()}>
                    {`Place in Line: ${displayBN(
                      new BigNumber(index - props.index)
                    )}`}
                    &nbsp;{' | '}&nbsp;
                    {` Pods: ${displayBN(props.items[index])}`}
                  </option>
                ))
            : null}
        </Select>
      </FormControl>
    </Box>
  );
}

ListInputField.defaultProps = {
  hidden: false,
  marginBottom: '-7px',
  label: 'Select Plot to Transfer',
  type: 'transfer',
  descriptor: 'available',
  style: {},
};
