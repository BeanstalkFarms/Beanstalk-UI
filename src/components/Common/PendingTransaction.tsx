import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { useTransactions } from 'state/general/hooks';
import { State, Transaction } from 'state/general/actions';

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
      {transactions &&
        transactions.length > 0 &&
        transactions.map((transaction: Transaction) => (
          <Snackbar
            key={transaction.transactionNumber}
            open={transaction.state === State.PENDING}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <Alert
              severity="warning"
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
