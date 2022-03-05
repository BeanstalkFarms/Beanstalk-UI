import React from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@material-ui/core';
import { useSelector, useStore } from 'react-redux';
import { AppState } from 'state';
import { getAPYs } from 'util/index';
import { makeStyles } from "@material-ui/styles";
import { theme } from "../../constants";
import TOKENS from 'constants/siloTokens';


const useStyles = makeStyles({
  table: {
    margin: '9px',
    width: 'auto',
    backgroundColor: theme.module.background,
    borderRadius: 25
  },
  tableBox: {
    display: "block",
    width: "100%"
  },
  tablePaper: {
    borderRadius: 25
  }
});



export default function TokenDataTable() {
  const classes = useStyles();

  const { stats } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );

  const { farmableMonth } = useSelector<AppState, AppState['beansPerSeason']>(
    (state) => state.beansPerSeason
  );

  const totalBalance = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  // console.log("TOTAL BEANS: ");
  // console.log(totalBalance.totalBeans.toNumber());

  const userBalance = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );



  // on each render, grab APY array
  const apys = getAPYs(
    farmableMonth,
    parseFloat(totalBalance.totalStalk),
    parseFloat(totalBalance.totalSeeds)
  );

  const [beanAPY, lpAPY] = apys;

  const testTokens = [
    {
      label: 'BEAN:ETH',
      slug: 'bean-eth',
      rewards: '1 Stalk, 4 Seeds',
      apy: 17,
      deposits: 1224
    },
    {
      label: 'BEAN:3CRV',
      slug: 'bean-3crv',
      rewards: '1 Stalk, 4 Seeds',
      apy: 17,
      deposits: 1224
    },
    {
      label: 'Bean Silo',
      slug: 'bean-silo',
      rewards: '1 Stalk, 4 Seeds',
      apy: 17,
      deposits: 1224
    },
  ];

  return (
    <Box className={classes.tableBox}>
      <TableContainer className={classes.table}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>SILO</TableCell>
              <TableCell align="center">REWARDS</TableCell>
              <TableCell align="center">APY</TableCell>
              <TableCell align="center">DEPOSITS</TableCell>
              <TableCell align="center"> </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>

            {TOKENS.map((token) => (
              <TableRow
                key={token.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {token.name}
                </TableCell>
                <TableCell align="center">
                  {token.rewards.stalk} Stalk, {token.rewards.seeds} Seeds
                </TableCell>
                <TableCell align="center">{Math.round(token.getAPY(apys))}%</TableCell>
                <TableCell align="center">
                  {token.getUserBalance(userBalance).decimalPlaces(2).toNumber()}
                </TableCell>
                <TableCell align="center">
                  <Button
                    style={{ marginTop: '8px', marginBottom: '8px', textAlign: 'center' }}
                    color="primary"
                    variant="contained"
                    href={`/farm/silo/${token.slug}`}
                  >
                    ENTER
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
