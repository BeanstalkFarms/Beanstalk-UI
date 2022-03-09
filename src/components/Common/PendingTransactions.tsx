import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
// import Typography from '@material-ui/core/Typography';
// import Alert from '@material-ui/lab/Alert';
// import Snackbar from '@material-ui/core/Snackbar';
// import CircularProgress from '@material-ui/core/CircularProgress';
// import { useTransactions } from 'state/general/hooks';
// import { TransactionState, Transaction } from 'state/general/actions';
// import { chainId } from 'util/index';

// const useStyles = makeStyles(() =>
//   createStyles({
//     alert: {
//       borderRadius: 10,
//       //
//     },
//     inner: {
//       display: 'flex',
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//     }
//   })
// );

/**
 * DEPRECATED 1/23/2022
 * To be upgraded/replaced during form state overhaul, Q1 2022.
 * Leaving code here for future review.
 */
const PendingTransactions = () => 
   null
  // const classes = useStyles();
  // const transactions = useTransactions();
  // return (
  //   <>
  //     {transactions && transactions.length > 0 &&
  //       transactions.map((transaction: Transaction) => (
  //         <Snackbar
  //           key={transaction.transactionNumber}
  //           open={transaction.state === TransactionState.PENDING}
  //           anchorOrigin={{
  //             vertical: 'bottom',
  //             horizontal: 'right',
  //           }}
  //         >
  //           <Alert
  //             severity="success"
  //             icon={false}
  //             variant="filled"
  //             classes={{ root: classes.alert }}
  //           >
  //             <div className={classes.inner}>
  //               <CircularProgress
  //                 size={20}
  //                 thickness={6}
  //                 style={{ marginRight: 8 }}
  //                 color={'#ffffff'}
  //               />
  //               <Typography component="span">
  //                 {transaction.description}
  //               </Typography>
  //             </div>
  //             {transaction.transactionHash ? (
  //               <a href={`https://${chainId === 3 ? 'ropsten.' : ''}etherscan.io/tx/${transaction.transactionHash}`} target="_blank" rel="noreferrer">View on Etherscan</a>
  //             ) : null}
  //           </Alert>
  //         </Snackbar>
  //       ))}
  //   </>
  // );
;

export default PendingTransactions;
