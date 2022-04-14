// ARCHIVED:
// We replaced this with Uniswap's swap module. To prevent accidental
// bundling I'm commenting it out for now, we can reuse later if we 
// decide to reintroduce our own swap page with 1inch support, etc.
// -SC

// import React from 'react';
// import { makeStyles } from '@mui/styles';

// const useStyles = makeStyles({
//   leftTransactionStyle: {
//     display: 'inline-block',
//     fontFamily: 'Futura-PT-Book',
//     textAlign: 'left',
//     width: '50%',
//   },
//   rightTransactionStyle: {
//     display: 'inline-block',
//     fontFamily: 'Futura-PT-Book',
//     fontSize: 'calc(9px + 0.5vmin)',
//     textAlign: 'right',
//     width: '50%',
//   },
//   transactionStyle: {
//     border: '1px solid black' as const,
//     borderRadius: '15px',
//     color: 'black',
//     fontSize: 'calc(9px + 0.5vmin)',
//     marginBottom: '-4px',
//     marginLeft: '5%',
//     padding: '12px',
//     width: '90%',
//   }
// });

// export default function SwapTransactionDetailsModule(props: {
//   fields: { [key: string]: any }
// }) {
//   const classes = useStyles();
//   return (
//     <p className={classes.transactionStyle}>
//       {Object.keys(props.fields).map((key, i) => (
//         <>
//           <span key={`${i}-left`} className={classes.leftTransactionStyle}>
//             {key}
//           </span>
//           <span key={`${i}-right`} className={classes.rightTransactionStyle}>
//             {props.fields[key]}
//           </span>
//         </>
//       ))}
//     </p>
//   );
// }
