  import React from 'react';
import {
  Box,
  Button,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@material-ui/core';
import TokenIcon from 'components/Common/TokenIcon';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { CryptoAsset, displayBN, FarmAsset } from 'util/index';


export default function TokenDataTable({ tokens }) {
  const { stats } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );

  const { totalBeans } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );




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
    <div>
      <TableContainer  component={Paper}>
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

            {tokens.map((token) => (
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
                <TableCell align="center">{token.name}</TableCell>
                <TableCell align="center">
                  123
                  {/*{token.getTotalBalance(totalBeans)}*/}
                </TableCell>
                <TableCell align="center">
                  <Button
                    // className={classes.formButton}
                    style={{ marginTop: '8px', textAlign: 'center' }}
                    color="primary"
                    variant="contained"
                    href={`#`}
                  >
                    ENTER
                  </Button>
                </TableCell>
              </TableRow>
            ))}


            {/*{testTokens.map((token) => (*/}
            {/*  <TableRow*/}
            {/*    key={token.label}*/}
            {/*    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}*/}
            {/*  >*/}
            {/*    <TableCell component="th" scope="row">*/}
            {/*      {token.label}*/}
            {/*    </TableCell>*/}
            {/*    <TableCell align="center">{token.rewards}</TableCell>*/}
            {/*    <TableCell align="center">{token.apy}</TableCell>*/}
            {/*    <TableCell align="center">{token.deposits}</TableCell>*/}
            {/*    <TableCell align="center">*/}
            {/*      <Button*/}
            {/*        // className={classes.formButton}*/}
            {/*        style={{ marginTop: '8px', textAlign: 'center' }}*/}
            {/*        color="primary"*/}
            {/*        variant="contained"*/}
            {/*        href={`/cole/test`}*/}
            {/*      >*/}
            {/*        ENTER*/}
            {/*      </Button>*/}
            {/*    </TableCell>*/}
            {/*  </TableRow>*/}
            {/*))}*/}
          </TableBody>
        </Table>
      </TableContainer>

    </div>

  );
}
