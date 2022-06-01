import React from 'react';
import BigNumber from 'bignumber.js';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {
  CryptoAsset,
  displayBN,
  displayFullBN,
  FarmAsset,
  SiloAsset,
  TokenLabel,
  TransitAsset,
} from 'util/index';
import { theme } from 'constants/index';
import {
  claimStrings,
  StyledTooltip,
  TablePageSelect,
  QuestionModule,
  BalanceTableCell,
} from './index';

const useStyles = makeStyles({
  table: {
    minWidth: 200,
    '& .MuiTableCell-root': {},
    '& .MuiTableCell-head': {
      alignItems: 'center',
      fontWeight: 'bold',
    },
  },
  pagination: {
    alignItems: 'center',
    color: theme.text,
    display: 'flex',
    justifyContent: 'center',
  },
  lucidaStyle: {
    borderColor: theme.accentColor,
    color: theme.text,
    fontFamily: 'Lucida Console',
    fontSize: '11px',
  },
  claimableStyle: {
    borderColor: theme.accentColor,
    color: 'white',
    fontFamily: 'Futura-PT',
    fontWeight: 'bold',
    width: '33%',
  },
  titleStyle: {
    borderColor: theme.accentColor,
    color: theme.text,
    fontFamily: 'Futura-PT',
    width: '33%',
  },
});

// FIXME: Resolve this with the tables used in the Marketplace.
// FIXME: types and code ceanup
const BasicTable = (props) => {
  const classes = useStyles();

  const { rowsPerPage } = props;

  function displayLP(balance) {
    if (props.isCurve) {
      return `${displayBN(balance[0])} BEAN/${displayBN(
        balance[1]
      )} 3CRV`;
    }
    if (props.isLUSD) {
      return `${displayBN(balance[0])} BEAN/${displayBN(
        balance[1]
      )} LUSD`;
    }
    return `${displayBN(balance[0])} BEAN/${displayBN(
      balance[1]
    )} ${TokenLabel(CryptoAsset.Ethereum)}`;
  }

  const reverse =
    props.asset === FarmAsset.Pods ||
    props.asset === TransitAsset.Bean ||
    props.asset === TransitAsset.LP;

  const titles = [props.indexTitle, TokenLabel(props.asset)];
  let stalkCrates;
  if (props.asset === SiloAsset.Bean || props.asset === SiloAsset.LP) {
    titles.push('Stalk');
    if (props.bdvCrates !== undefined) {
      // Curve LP Deposits
      stalkCrates = Object.keys(props.bdvCrates).reduce((crates, k) => {
        crates[k] = props.season
          .minus(k)
          .multipliedBy(props.bdvCrates[k])
          .multipliedBy(0.0001)
          .plus(props.bdvCrates[k]);
        return crates;
      }, {});
    } else if (props.seedCrates !== undefined) {
      // Uniswap LP Deposits
      stalkCrates = Object.keys(props.seedCrates).reduce((crates, k) => {
        crates[k] = props.season
          .minus(k)
          .multipliedBy(props.seedCrates[k])
          .multipliedBy(0.0001)
          .plus(props.seedCrates[k].dividedBy(4));
        return crates;
      }, {});
    } else {
      // Bean Deposits
      stalkCrates = Object.keys(props.crates).reduce((crates, k) => {
        crates[k] = props.season
          .minus(k)
          .multipliedBy(props.crates[k])
          .multipliedBy(0.0002)
          .plus(props.crates[k]);
        return crates;
      }, {});
    }
  }
  if (props.seedCrates !== undefined || props.bdvCrates !== undefined) titles.push('Seeds');

  let claimWord = 'Claimable';
  let claimableRow;
  let claimDescription = `Claimable ${TokenLabel(props.asset)}`;
  if (
    props.claimableBalance !== undefined &&
    props.claimableBalance.isGreaterThan(0)
  ) {
    if (props.asset === FarmAsset.Pods) {
      claimWord = 'Harvestable';
      claimDescription = claimStrings.harvestable;
    }
    if (props.asset === SiloAsset.Bean) {
      claimWord = 'Farmable';
      claimDescription = claimStrings.farmable;
    }
    claimableRow = (
      <TableRow style={{ backgroundColor: theme.primary }}>
        <TableCell
          align="center"
          component="th"
          scope="season"
          className={classes.claimableStyle}
        >
          <Box>
            {claimWord}
            <QuestionModule
              description={claimDescription}
              margin="-7px 0 0 0"
              marginTooltip="10px 0 0 0 "
              placement="bottom"
            />
          </Box>
        </TableCell>
        <BalanceTableCell align="center" color="white" className={classes.lucidaStyle} balance={props.claimableBalance} label={TokenLabel(props.asset)} />
        {props.claimableStalk !== undefined ? (
          <BalanceTableCell align="center" color="white" className={classes.lucidaStyle} balance={props.claimableStalk} label={TokenLabel(SiloAsset.Stalk)} />
        ) : null}
      </TableRow>
    );
  } else {
    <></>;
  }

  return (
    <Box>
      <TableContainer>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow key={claimWord}>
              {titles.map((t) => (
                <TableCell key={t} align="center" className={classes.titleStyle}>
                  {t}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {claimableRow}
            {(reverse
              ? Object.keys(props.crates).sort((a, b) => a - b)
              : Object.keys(props.crates)
                  .sort((a, b) => a - b)
                  .reverse()
            )
              .slice(
                props.page * rowsPerPage,
                props.page * rowsPerPage + rowsPerPage
              )
              .map((season) => (
                <TableRow key={season}>
                  <TableCell
                    align="center"
                    className={classes.lucidaStyle}
                    component="th"
                    scope="season"
                  >
                    {props.asset === FarmAsset.Pods
                      ? displayBN(new BigNumber(season - props.index))
                      : season - props.index}
                  </TableCell>
                  <TableCell align="center" className={classes.lucidaStyle}>
                    <StyledTooltip
                      placement="right"
                      title={
                        props.isLP
                          ? displayLP(
                              props.poolForLPRatio(props.crates[season])
                            )
                          : `${displayFullBN(
                              props.crates[season]
                            )} ${TokenLabel(props.asset)}`
                      }
                    >
                      <span>{displayBN(props.crates[season])}</span>
                    </StyledTooltip>
                  </TableCell>
                  {stalkCrates !== undefined ? (
                    <TableCell align="center" className={classes.lucidaStyle}>
                      <StyledTooltip
                        placement="right"
                        title={`${displayFullBN(
                          stalkCrates[season]
                        )} ${TokenLabel(SiloAsset.Stalk)}`}
                      >
                        <span>{displayBN(stalkCrates[season])}</span>
                      </StyledTooltip>
                    </TableCell>
                  ) : null}
                  {props.seedCrates !== undefined ? (
                    <TableCell align="center" className={classes.lucidaStyle}>
                      <StyledTooltip
                        placement="right"
                        title={`${displayFullBN(
                          props.seedCrates[season]
                        )} ${TokenLabel(SiloAsset.Seed)}`}
                      >
                        <span>{displayBN(props.seedCrates[season])}</span>
                      </StyledTooltip>
                    </TableCell>
                  ) : null}
                  {props.bdvCrates !== undefined ? (
                    <TableCell align="center" className={classes.lucidaStyle}>
                      <StyledTooltip
                        placement="right"
                        title={`${displayFullBN(
                          props.bdvCrates[season].multipliedBy(props.bdvPerSeed)
                        )} ${TokenLabel(SiloAsset.Seed)}`}
                      >
                        <span>{displayBN(props.bdvCrates[season].multipliedBy(props.bdvPerSeed))}</span>
                      </StyledTooltip>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      {Object.keys(props.crates).length > rowsPerPage ? (
        <TablePagination
          className={classes.pagination}
          component="div"
          count={Object.keys(props.crates).length}
          onPageChange={props.handleChange}
          page={props.page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[]}
          labelDisplayedRows={({ from, count }) =>
            `${Math.ceil(from / rowsPerPage)}-${
              count !== -1 ? Math.ceil(count / rowsPerPage) : 0
            }`
          }
          ActionsComponent={
            Object.keys(props.crates).length > (rowsPerPage * 2)
              ? TablePageSelect
              : undefined
          }
        />
      ) : null}
    </Box>
  );
};

export default function ListTable(props) {
  return (
    <Box style={props.style}>
      <BasicTable {...props} />
    </Box>
  );
}

ListTable.defaultProps = {
  crates: {},
  claimableCrates: {},
  index: 0,
  page: 0,
  resetPage: 0,
  rowsPerPage: 3,
  bdvPerSeed: 4,
};
