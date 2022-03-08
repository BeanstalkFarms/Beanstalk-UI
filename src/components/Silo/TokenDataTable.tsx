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
import { FormatTooltip, QuestionModule, siloStrings } from 'components/Common';
import { theme } from '../../constants';
import { getUSDValueOfSiloDeposits } from "../../util/getUSDValueOfSiloDeposits";

const useStyles = makeStyles({
  table: {
    backgroundColor: theme.module.background,
    borderRadius: 25,
    fontFamily: 'Futura-PT-Book',
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
    },
    '& td': {
      fontSize: 15,
      fontFamily: 'Futura-PT-Book',
    }
  },
  headerCell: {
    fontWeight: 'bold',
    fontFamily: 'Futura-PT-Book',
  },
  apy: {
    fontFamily: 'Lucida Console',
    fontSize: 13,
    // fontFamily: 'Futura-PT-Book',
    backgroundColor: '#C4C4C44D',
    padding: '6px 9px',
    borderRadius: '6px',
  },
  tableRow: {
    maxWidth: '100vw',
    overflow: 'auto'
  }
});

export default function TokenDataTable() {
  const classes = useStyles();
  const history = useHistory();

  const { farmableMonth } = useSelector<AppState, AppState['beansPerSeason']>(
    (state) => state.beansPerSeason
  );

  const userBalanceState = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const priceState = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  const totalBalanceState = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  // on each render, grab APY array
  const apys = getAPYs(
    farmableMonth,
    parseFloat(totalBalanceState.totalStalk),
    parseFloat(totalBalanceState.totalSeeds)
  );



  return (
    <TableContainer className={classes.table}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow className={classes.tableRow}>
            <TableCell className={`${classes.headerCell}`}>
              SILO
              <QuestionModule
                description={siloStrings.siloDescription.replace('{0}', totalBalanceState.withdrawSeasons.toFixed(0))}
                placement="right"
                margin="-7px 8px 0 0"
              />
            </TableCell>
            <TableCell align="left" className={classes.headerCell}>
              REWARDS
              <QuestionModule
                description={siloStrings.rewardsColumn}
                placement="right"
                margin="-7px 8px 0 0"
              />
            </TableCell>
            <TableCell align="center" className={classes.headerCell}>
              vAPY
              <QuestionModule
                description={(
                  <span>{siloStrings.variableAPY} <a href="https://app.bean.money/docs/APY.html" target="_blank" rel="noreferrer">click here</a>.</span>
                )}
                placement="right"
                margin="-7px 8px 0 0"
              />
            </TableCell>
            <TableCell align="right" className={classes.headerCell}>
              DEPOSITS
              <QuestionModule
                description={siloStrings.depositsColumn}
                placement="right"
                margin="-7px 8px 0 0"
              />
            </TableCell>
            <TableCell align="center" className={classes.headerCell} />
          </TableRow>
        </TableHead>
        <TableBody>
          {TOKENS.map((token) => (
            <TableRow
              key={token.name}
              className={classes.row}
              onClick={() => history.push(`/silo/${token.slug}`)}
            >
              <TableCell scope="row">
                <div className={classes.tokenNameCell}>
                  <img src={token.icon} alt="" className={classes.tokenImage} />
                  <span>{token.name}</span>
                </div>
              </TableCell>
              <TableCell align="left">
                <FormatTooltip
                  margin="10px"
                  placement="top"
                  title={(
                    <>
                      <span><strong>{token.rewards.stalk} Stalk</strong>: {siloStrings.stalkDescription}</span><br />
                      <span><strong>{token.rewards.seeds} Seeds</strong>: {siloStrings.seedDescription}</span>
                    </>
                  )}
                >
                  <span>
                    <span>{token.rewards.stalk}<TokenIcon token={SiloAsset.Stalk} style={{ width: '17px', height: '17px' }} /></span>
                    <span>&nbsp;</span>
                    <span>{token.rewards.seeds}<TokenIcon token={SiloAsset.Seed} style={{ width: '17px', height: '17px' }} /></span>
                  </span>
                </FormatTooltip>
              </TableCell>
              <TableCell align="center">
                <FormatTooltip
                  margin="10px"
                  placement="top"
                  title={`${token.getAPY(apys).toFixed(1)}%`}
                >
                  <span className={classes.apy}>
                    {token.getAPY(apys).toFixed(1)}%
                  </span>
                </FormatTooltip>
              </TableCell>
              <TableCell align="right">
                <FormatTooltip
                  margin="10px"
                  placement="top"
                  title={`$${displayBN(token.getDepositBalanceInUSD(userBalanceState, priceState, totalBalanceState))} USD`}
                >
                  <span className={classes.apy}>
                    {displayBN(token.getUserBalance(userBalanceState))}
                  </span>
                </FormatTooltip>

              </TableCell>
              <TableCell align="center">
                <ChevronRightIcon style={{ marginTop: 3 }} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/* <Button
  style={{ marginTop: '8px', marginBottom: '8px', textAlign: 'center' }}
  color="primary"
  variant="contained"
  href={`/farm/silo/${token.slug}`}
>
  ENTER
</Button> */
