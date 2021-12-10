import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { theme } from 'constants/index';
import { FormatTooltip, QuestionModule } from './index';

export default function HeaderLabel(props) {
  const classes = makeStyles(() => ({
    container: {
      backgroundColor: theme.secondary,
      borderRadius: '15px',
      boxShadow:
        '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%),0px 1px 10px 0px rgb(0 0 0 / 12%)',
      color: theme.accentText,
      display: 'flex',
      fontSize: '16px',
      margin: '-8px',
      padding: '4px 4px',
      textTransform: 'none',
    },
    subContainer: {
      display: 'flex',
      borderRadius: '15px 15px 0 0',
    },
    title: {
      fontFamily: 'Futura-PT-Book',
      padding: '5px',
      textAlign: 'left',
      width: '60%',
    },
    value: {
      fontFamily: 'Lucida Console',
      padding: '5px',
      textAlign: 'right',
      width: '40%',
    },
  }))();

  const questionTooltip =
    props.description !== undefined ? (
      <QuestionModule
        description={props.description}
        margin={props.margin}
        marginTooltip={props.marginTooltip}
        placement={props.placement}
      />
    ) : undefined;
  const balanceTooltip =
    props.balanceDescription !== undefined ? (
      <FormatTooltip
        margin="10px"
        placement="top"
        title={props.balanceDescription}
      >
        <span style={{ backgroundColor: '#C4C4C44D', padding: '5px', borderRadius: '6px' }}>{props.value}</span>
      </FormatTooltip>
    ) : (
      props.value
    );

  return (
    <Box
      className={
        props.container === undefined
          ? classes.container
          : classes.subContainer
      }
    >
      <Box className={classes.title}>
        {props.title}
        {questionTooltip}
      </Box>
      <Box className={classes.value}>{balanceTooltip}</Box>
    </Box>
  );
}

HeaderLabel.defaultProps = {
  margin: '-8px 0 0 2px',
  marginTooltip: '0 0 0 10px',
};
