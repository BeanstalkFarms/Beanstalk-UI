import React from 'react';
import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { theme } from 'constants/index';
import { StyledTooltip, QuestionModule } from './index';

const useStyles = makeStyles(() => ({
  // "container" => the label maintains its own background and margins.
  // Acts as a stand-alone item.
  container: {
    backgroundColor: theme.secondary,
    borderRadius: '15px',
    boxShadow:
      '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%),0px 1px 10px 0px rgb(0 0 0 / 12%)',
    color: theme.accentText,
    fontSize: '16px',
    margin: '-8px',
    padding: '4px 4px',
    textTransform: 'none',
    // Spread items out horizontally
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // "subContainer" => the label is nested within another element, likely
  // a <HeaderLabelList>.
  subContainer: {
    borderRadius: '15px 15px 0 0',
    // Spread items out horizontally
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  //
  title: {
    fontFamily: 'Futura-PT-Book',
    padding: '5px',
    textAlign: 'left',
  },
  value: {
    fontFamily: 'Lucida Console',
    padding: '5px',
    textAlign: 'right',
  },
  tooltipSpan: {
    backgroundColor: '#C4C4C44D',
    padding: '5px',
    borderRadius: '6px'
  }
}));
export default function HeaderLabel(props) {
  const classes = useStyles();

  //
  const questionTooltip =
    props.description !== undefined ? (
      <QuestionModule
        description={props.description}
        marginTooltip={props.marginTooltip}
        placement={props.placement}
      />
    ) : undefined;
  
  //
  const balanceTooltip =
    props.balanceDescription !== undefined ? (
      <StyledTooltip
        margin="10px"
        placement="top"
        title={props.balanceDescription}
      >
        <span className={classes.tooltipSpan}>{props.value}</span>
      </StyledTooltip>
    ) : (
      props.value
    );

  return (
    <Box
      className={
        props.container === true
          ? classes.container
          : classes.subContainer
      }
    >
      <Box className={classes.title}>
        {props.title}
        {questionTooltip}
      </Box>
      <Box className={classes.value}>
        {balanceTooltip}
      </Box>
    </Box>
  );
}

HeaderLabel.defaultProps = {
  marginTooltip: '0 0 0 10px',
  container: false,
};
