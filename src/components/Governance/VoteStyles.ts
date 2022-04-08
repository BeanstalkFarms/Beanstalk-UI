import { makeStyles } from '@material-ui/core/styles';
import { theme } from 'constants/index';

export const useStyles = makeStyles({
  inputModule: {
    backgroundColor: theme.module.background,
    borderRadius: '25px',
    color: 'black',
    marginTop: '18px',
    maxWidth: '550px',
    padding: '10px',
  },
  formButton: {
    borderRadius: '15px',
    fontFamily: 'Futura-Pt-Book',
    fontSize: 'calc(12px + 1vmin)',
    height: '44px',
    margin: '20px 0 10px',
    width: '200px',
  },
  title: {
    display: 'inline-block',
    fontFamily: 'Futura-Pt-Book',
    fontSize: '18px',
    marginTop: '10px',
    textAlign: 'center',
    width: '100%',
  },
  cell: {
    fontFamily: 'Futura-PT',
    borderColor: theme.accentColor,
  },
  cellTitle: {
    fontFamily: 'Futura-PT-Book',
    borderColor: theme.accentColor,
  },
  table: {
    backgroundColor: theme.module.background,
    margin: '8px',
    width: 'auto',
  },
  futuraPT: {
    fontFamily: 'Futura-Pt',
  },
  rowSelected: {
    backgroundColor: theme.voteSelect,
    cursor: 'pointer'
  },
  pointerCursor: {
    cursor: 'pointer'
  }
});
