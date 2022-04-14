import React from 'react';
import BigNumber from 'bignumber.js';
import {
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  Select,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { displayBN } from 'util/index';
import { UserBalanceState } from 'state/userBalance/reducer';

const useStyles = makeStyles({
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
    width: '100%',
    marginRight: '13px',
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
  outlinedInput: {
    height: 'calc(56px + 1vmin)'
  }
});

type PlotListInputFieldProps = {
  /*
   * Harvestable Index 
   * FIXME: rename this
   */
  index: BigNumber;
  /*
   * Plots
   * FIXME: rename this
   */
  items: UserBalanceState['plots'];
  handleChange: Function;
  //
  label?: string;
  type?: string;
  hidden?: boolean;
  style?: any;
  descriptor?: string;
  title?: string;
  //
  marginBottom?: string;
}
export default function ListInputField(props: PlotListInputFieldProps) {
  const classes = useStyles();

  if (props.hidden) return null;
  const itemKeys = Object.keys(props.items);

  return (
    <Box sx={{ margin: '8px 0', ...props.style }}>
      <Box className={classes.smallLabels}>
        {props.label}
      </Box>
      <FormControl
        variant="outlined"
        size="medium"
        className={classes.formControl}
        style={{
          marginBottom: props.marginBottom,
        }}
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
              className={classes.outlinedInput}
            />
          }
        >
          {itemKeys.length > 0 ? (
            <option value="default">Select Plot to {props.type}</option>
          ) : (
            <option>You have no Plots {props.descriptor} to {props.type}</option>
          )}
          {itemKeys.length > 0
            // FIXME: only sort if itemKeys changes
            ? itemKeys
                .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
                .map((index) => (
                  <option key={index} value={index}>
                    {`Place in Line: ${displayBN(
                      new BigNumber(index).minus(props.index)
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
