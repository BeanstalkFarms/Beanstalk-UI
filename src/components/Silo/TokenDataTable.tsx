import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { AppState } from 'state';
import { APYTuple, CryptoAsset, displayBN, getAPYs, SiloAsset } from 'util/index';
import { makeStyles } from '@material-ui/core/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import TOKENS from 'constants/siloTokens';
import TokenIcon from 'components/Common/TokenIcon';
import { FormatTooltip, QuestionModule, siloStrings } from 'components/Common';
import { theme as beanstalkTheme } from '../../constants';

const useStyles = makeStyles((theme) => ({
  table: {
    backgroundColor: beanstalkTheme.module.background,
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
  chip: {
    fontFamily: 'Lucida Console',
    fontSize: 13,
    backgroundColor: '#C4C4C44D',
    padding: '6px 9px',
    borderRadius: '6px',
    textAlign: 'center',
    fontWeight: 400,
  },
  tableRow: {
    maxWidth: '100vw',
    overflow: 'auto'
  },
  apyTooltipHeader: {
    display: 'inline-block',
    marginBottom: '4px',
  },
  //
  hideOnMobile: {
    [theme.breakpoints.down('md')]: {
      display: 'none',
    }
  }
}));

const APYTooltip = ({ apys, children } : { apys: APYTuple, children: any }) => {
  const classes = useStyles();
  return (
    <FormatTooltip
      margin="10px"
      placement="top"
      title={(
        <Box sx={{ px: 0, py: 0.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Box sx={{ 
              // border: '1px solid #ccc', p: 0.5, borderRadius: 4 
              mr: 1.5,
              // minWidth: '80px',
              flex: 1,
            }}>
              <span className={classes.apyTooltipHeader}><TokenIcon token={CryptoAsset.Bean} /> Bean vAPY</span>
              <Typography
                sx={{ fontSize: 18 }}
                className={classes.chip}>
                {apys[0].toFixed(1)}%
              </Typography>
            </Box>
            <Box sx={{ 
              // border: '1px solid #ccc', p: 0.5, borderRadius: 4
              // minWidth: '80px',
              flex: 1,
            }}>
              <span className={classes.apyTooltipHeader}><TokenIcon token={SiloAsset.Stalk} /> Stalk vAPY</span>
              <Typography
                sx={{ fontSize: 18 }}
                className={classes.chip}>
                {apys[1].toFixed(1)}%
              </Typography>
            </Box>
          </Box>
          <Box sx={{ pt: 0.5, maxWidth: '200px' }}>
            Silo Members earn Stalk every season, regardless of the number of new Beans minted.
          </Box>
        </Box>
      )}
    >
      {children}
    </FormatTooltip>
  );
};

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
              <span className={classes.hideOnMobile}>BEAN&nbsp;</span>vAPY
              <QuestionModule
                description={(
                  <span>{siloStrings.variableAPY} <a href="https://app.bean.money/docs/APY.html" target="_blank" rel="noreferrer">click here</a>.</span>
                )}
                placement="right"
                margin="-7px 8px 0 0"
              />
            </TableCell>
            <TableCell align="center" className={`${classes.headerCell} ${classes.hideOnMobile}`}>
              STALK vAPY
              <QuestionModule
                description={(
                  <span>{siloStrings.variableAPY} <a href="https://app.bean.money/docs/APY.html" target="_blank" rel="noreferrer">click here</a>.</span>
                )}
                placement="right"
                margin="-7px 8px 0 0"
              />
            </TableCell>
            <TableCell align="right" className={`${classes.headerCell} ${classes.hideOnMobile}`}>
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
          {TOKENS.map((token) => {
            const tokenApys = token.getAPY(apys);
            return (
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
                  <APYTooltip apys={tokenApys}>
                    <span className={classes.chip}>
                      {tokenApys[0].toFixed(1)}%
                    </span>
                  </APYTooltip>
                </TableCell>
                <TableCell align="center" className={`${classes.headerCell} ${classes.hideOnMobile}`}>
                  <APYTooltip apys={tokenApys}>
                    <span className={classes.chip}>
                      {tokenApys[1].toFixed(1)}%
                    </span>
                  </APYTooltip>
                </TableCell>
                <TableCell align="right" className={`${classes.headerCell} ${classes.hideOnMobile}`}>
                  <FormatTooltip
                    margin="10px"
                    placement="top"
                    title={`${displayBN(token.getUserSiloBalance(userBalanceState))} ${token.name}`}
                  >
                    <span className={classes.chip}>
                      {`$${displayBN(token.getUserSiloBalanceInUSD(userBalanceState, priceState, totalBalanceState))}`}
                    </span>
                  </FormatTooltip>
                </TableCell>
                <TableCell align="center">
                  <ChevronRightIcon style={{ marginTop: 3 }} />
                </TableCell>
              </TableRow>
            );
          })}
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
