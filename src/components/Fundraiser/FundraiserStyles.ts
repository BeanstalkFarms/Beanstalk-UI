import { makeStyles } from '@material-ui/core';
import { theme } from 'constants/index';

export const useStyles = makeStyles({
  table: {
    backgroundColor: theme.module.background,
    margin: '8px',
    width: 'auto',
  },
  pagination: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    display: 'inline-block',
    fontFamily: 'Futura-Pt-Book',
    fontSize: '18px',
    marginTop: '10px',
    textAlign: 'center',
    width: '100%',
  },
  inputModule: {
    backgroundColor: theme.module.background,
    borderRadius: '25px',
    color: theme.text,
    marginTop: '18px',
    maxWidth: '800px',
    padding: '10px 10px 20px 10px',
    marginBottom: '80px',
  },
});
