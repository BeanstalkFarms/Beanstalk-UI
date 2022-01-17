import { makeStyles } from '@material-ui/core';
import { theme } from 'constants/index';

export const useStyles = makeStyles({
  table: {
    minWidth: 200,
    '& .MuiTableCell-root': {},
    '& .MuiTableCell-head': {
      alignItems: 'center',
      fontFamily: 'Futura',
    },
    '& .MuiTableCell-sizeSmall': {
      padding: '6px 12px 6px 12px',
    },
  },
  tableSmall: {
    minWidth: 200,
    '& .MuiTableCell-root': {},
    '& .MuiTableCell-head': {
      alignItems: 'center',
      fontFamily: 'Futura',
    },
    '& .MuiTableCell-sizeSmall': {
      padding: '6px 1px 6px 1px',
    },
  },
  lucidaStyle: {
    color: theme.text,
    fontFamily: 'Lucida Console',
    fontSize: '11px',
  },
  titleStyle: {
    display: 'inline-block',
    fontSize: '24px',
    textAlign: 'center',
    fontFamily: 'Futura-PT',
    marginTop: '13px',
    width: '100%',
  },
  filterButtonStyle: {
    display: 'inline-block',
  },
  buttonStyle: {
    color: 'white',
    backgroundColor: theme.linkColor,
  },
  // beanIcon: {
  //   width: 11,
  //   height: 11,
  //   verticalAlign: 'middle',
  //   marginLeft: 1,
  //   marginTop: -3,
  //   opacity: 0.7,
  // }
});
