import React from 'react';
import BigNumber from 'bignumber.js';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Box,
} from '@material-ui/core/';
import { makeStyles } from '@material-ui/styles';
import {
  CryptoAsset,
  displayBN,
  displayFullBN,
  FarmAsset,
  SiloAsset,
  TokenLabel,
  TransitAsset,
} from '../../util';
import { FormatTooltip, QuestionModule } from '.';
import { theme } from '../../constants';

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
    display: 'flex',
    justifyContent: 'center',
    color: theme.text,
  },
  lucidaStyle: {
    fontFamily: 'Lucida Console',
    fontSize: '11px',
    color: theme.text,
    borderColor: theme.accentColor,
  },
});

const claimableStyle = {
  fontFamily: 'Futura-PT',
  color: theme.accentText,
  fontWeight: 'bold',
  width: '33%',
  borderColor: theme.accentColor,
};

function displayLP(balance) {
  return `${displayBN(balance[0])} ${TokenLabel(CryptoAsset.Bean)}/${displayBN(
    balance[1]
  )} ${TokenLabel(CryptoAsset.Ethereum)}`;
}

const BasicTable = (props) => {
  const classes = useStyles();

  const { rowsPerPage } = props;

  const reverse =
    props.asset === FarmAsset.Pods ||
    props.asset === TransitAsset.Bean ||
    props.asset === TransitAsset.LP;

  const titles = [props.indexTitle, TokenLabel(props.asset)];
  let stalkCrates;
  if (props.asset === SiloAsset.Bean || props.asset === SiloAsset.LP) {
    titles.push('Stalk');
    if (props.seedCrates === undefined) {
      stalkCrates = Object.keys(props.crates).reduce((crates, k) => {
        crates[k] = props.season
          .minus(k)
          .multipliedBy(props.crates[k])
          .multipliedBy(0.0002)
          .plus(props.crates[k]);
        return crates;
      }, {});
    } else {
      stalkCrates = Object.keys(props.seedCrates).reduce((crates, k) => {
        crates[k] = props.season
          .minus(k)
          .multipliedBy(props.seedCrates[k])
          .multipliedBy(0.0001)
          .plus(props.seedCrates[k].dividedBy(4));
        return crates;
      }, {});
    }
  }
  if (props.seedCrates !== undefined) titles.push('Seeds');

  let claimWord = 'Claimable';
  let claimableRow;
  let claimDescription = `Claimable ${TokenLabel(props.asset)}`;
  if (
    props.claimableBalance !== undefined &&
    props.claimableBalance.isGreaterThan(0)
  ) {
    if (props.asset === FarmAsset.Pods) {
      claimWord = 'Harvestable';
      claimDescription =
        'Harvestable Pods can be redeemed for 1 Bean each, at any time.';
    }
    if (props.asset === SiloAsset.Bean) {
      claimWord = 'Farmable';
      claimDescription = `Farmable ${TokenLabel(
        props.asset
      )} are deposited in a specific Season the next time you interact with the Silo.`;
    }
    claimableRow = (
      <TableRow style={{ backgroundColor: theme.primary }}>
        <TableCell
          align="center"
          component="th"
          scope="season"
          style={claimableStyle}
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
        <TableCell
          align="center"
          className={classes.lucidaStyle}
          style={{ color: 'white' }}
        >
          <FormatTooltip
            placement="right"
            title={
              props.isLP
                ? displayLP(props.poolForLPRatio(props.claimableBalance))
                : `${displayFullBN(props.claimableBalance)} ${TokenLabel(
                    props.asset
                  )}`
            }
          >
            <span>{displayBN(props.claimableBalance)}</span>
          </FormatTooltip>
        </TableCell>
        {props.claimableStalk !== undefined ? (
          <TableCell
            align="center"
            className={classes.lucidaStyle}
            style={{ color: 'white' }}
          >
            <FormatTooltip
              placement="right"
              title={`${displayFullBN(props.claimableStalk)} ${TokenLabel(
                SiloAsset.Stalk
              )}`}
            >
              <span>{displayBN(props.claimableStalk)}</span>
            </FormatTooltip>
          </TableCell>
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
                <TableCell
                  key={t}
                  align="center"
                  style={{ fontFamily: 'Futura-PT', width: '33%', color: theme.text, borderColor: theme.accentColor }}
                >
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
                    <FormatTooltip
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
                    </FormatTooltip>
                  </TableCell>
                  {stalkCrates !== undefined ? (
                    <TableCell align="center" className={classes.lucidaStyle}>
                      <FormatTooltip
                        placement="right"
                        title={`${displayFullBN(
                          stalkCrates[season]
                        )} ${TokenLabel(SiloAsset.Stalk)}`}
                      >
                        <span>{displayBN(stalkCrates[season])}</span>
                      </FormatTooltip>
                    </TableCell>
                  ) : null}
                  {props.seedCrates !== undefined ? (
                    <TableCell align="center" className={classes.lucidaStyle}>
                      <FormatTooltip
                        placement="right"
                        title={`${displayFullBN(
                          props.seedCrates[season]
                        )} ${TokenLabel(SiloAsset.Seed)}`}
                      >
                        <span>{displayBN(props.seedCrates[season])}</span>
                      </FormatTooltip>
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
};
