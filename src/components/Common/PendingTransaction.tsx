import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { useTransactions } from 'state/general/hooks';
import { Transaction } from 'state/general/actions';

const useStyles = makeStyles(() =>
  createStyles({
    alert: {
      alignItems: 'center',
      borderRadius: 10,
    },
  })
);

const Alerts = () => {
  const classes = useStyles();
  const transactions = useTransactions();

  return (
    <>
      {transactions.length > 0 &&
        transactions.map((transaction: Transaction) => (
          <Snackbar
            key={transaction.transactionNumber}
            open
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <Alert
              severity="success"
              variant="filled"
              style={{ minHeight: 80 }}
              classes={{ root: classes.alert }}
            >
              <Typography component="span">
                {transaction.description}
              </Typography>
            </Alert>
          </Snackbar>
        ))}
    </>
  );
};

export default Alerts;
