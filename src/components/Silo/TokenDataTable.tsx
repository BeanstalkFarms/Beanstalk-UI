import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@material-ui/core';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { AppState } from 'state';
import { displayBN, getAPYs, SiloAsset } from 'util/index';
import { makeStyles } from '@material-ui/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import TOKENS from 'constants/siloTokens';
import TokenIcon from 'components/Common/TokenIcon';
import { theme } from '../../constants';

const useStyles = makeStyles({
  table: {
    // margin: '9px 0px',
    // width: 'auto',
    backgroundColor: theme.module.background,
    borderRadius: 25
  },
  tableBox: {
    display: 'block',
    width: '100%'
  },
  tablePaper: {
    borderRadius: 25
  },
  tokenImage: {
    display: 'inline-block',
    marginRight: 12,
    height: 30,
    width: 30
  },
  tokenNameCell: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.04)',
      cursor: 'pointer',
    }
  },
  headerCell: {
    fontWeight: 'bold',
  }
});

// const testTokens = [
//   {
//     label: 'BEAN:ETH',
//     slug: 'bean-eth',
//     rewards: '1 Stalk, 4 Seeds',
//     apy: 17,
//     deposits: 1224
//   },
//   {
//     label: 'BEAN:3CRV',
//     slug: 'bean-3crv',
//     rewards: '1 Stalk, 4 Seeds',
//     apy: 17,
//     deposits: 1224
//   },
//   {
//     label: 'Bean Silo',
//     slug: 'bean-silo',
//     rewards: '1 Stalk, 4 Seeds',
//     apy: 17,
//     deposits: 1224
//   },
// ];

export default function TokenDataTable() {
  const classes = useStyles();
  const history = useHistory();

  const { farmableMonth } = useSelector<AppState, AppState['beansPerSeason']>(
    (state) => state.beansPerSeason
  );

  const totalBalance = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  const userBalance = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  // on each render, grab APY array
  const apys = getAPYs(
    farmableMonth,
    parseFloat(totalBalance.totalStalk),
    parseFloat(totalBalance.totalSeeds)
  );

  return (
    <Box className={classes.tableBox}>
      <TableContainer className={classes.table}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.headerCell}>SILO</TableCell>
              <TableCell align="left" className={classes.headerCell}>REWARDS</TableCell>
              <TableCell align="left" className={classes.headerCell}>vAPY</TableCell>
              <TableCell align="right" className={classes.headerCell}>DEPOSITS</TableCell>
              <TableCell align="center" className={classes.headerCell}> </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {TOKENS.map((token) => (
              <TableRow key={token.name} className={classes.row} onClick={() => history.push(`/farm/silo/${token.slug}`)}>
                <TableCell component="th" scope="row">
                  <div className={classes.tokenNameCell}>
                    <img src={token.icon} alt="" className={classes.tokenImage} />
                    <span>{token.name}</span>
                  </div>
                </TableCell>
                <TableCell align="left" style={{ fontSize: 15 }}>
                  <span>{token.rewards.stalk}<TokenIcon token={SiloAsset.Stalk} style={{ width: '17px', height: '17px' }} /></span>
                  <span>&nbsp;</span>
                  <span>{token.rewards.seeds}<TokenIcon token={SiloAsset.Seed} style={{ width: '17px', height: '17px' }} /></span>
                </TableCell>
                <TableCell align="left">{Math.round(token.getAPY(apys))}%</TableCell>
                <TableCell align="right">
                  {displayBN(token.getUserBalance(userBalance))}
                </TableCell>
                <TableCell align="center">
                  <ChevronRightIcon />
                  {/* <Button
                    style={{ marginTop: '8px', marginBottom: '8px', textAlign: 'center' }}
                    color="primary"
                    variant="contained"
                    href={`/farm/silo/${token.slug}`}
                  >
                    ENTER
                  </Button> */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
