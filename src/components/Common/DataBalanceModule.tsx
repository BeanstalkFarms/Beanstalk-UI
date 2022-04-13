import React from 'react';
import { Box, Stack } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FormatTooltip, QuestionModule } from '.';

const useStyles = makeStyles({
  root: {
    margin: '6px 10px',
  },
  title: {
    fontSize: '14px',
    fontFamily: 'Futura-PT-Book',
    margin: '2px',
  },
  balance: {
    fontSize: '12px',
    fontFamily: 'Lucida Console',
    fontWeight: '400',
  }
});

const DataBalanceModule : React.FC<{
  title?: string;
  content?: string;
  style?: any;
  balance?: string;
  balanceDescription?: string;
  placement?: string;
  margin?: string;
  description?: string;
  direction?: 'row' | 'column';
}> = (props) => {
  const classes = useStyles();

  const spanContent = (
    <span>
      {props.content !== undefined ? (
        props.content
      ) : (
        <Box className="BalanceModule-balanceContent" sx={props.style}>
          {props.balance}
        </Box>
      )}
    </span>
  );
  const balanceSection = props.balanceDescription !== undefined ? (
    <FormatTooltip
      margin={props.margin}
      placement={props.placement !== undefined ? props.placement : 'right'}
      title={props.balanceDescription}
    >
      {spanContent}
    </FormatTooltip>
  ) : (
    spanContent
  );

  return (
    <Stack direction={props.direction || 'row'} alignItems="center" justifyContent="space-between" className={classes.root}>
      <div className={classes.title}>
        {props.title}
        <QuestionModule
          description={props.description}
          margin="-6px 0 0 0"
          placement={props.placement || 'top'}
        />
      </div>
      <div className={classes.balance}>
        {balanceSection}
      </div>
    </Stack>
  );
};

export default DataBalanceModule;
