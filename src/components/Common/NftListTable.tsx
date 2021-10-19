import React from 'react';
import BigNumber from 'bignumber.js';
import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import {
  BASE_ETHERSCAN_ADDR_LINK,
  BASE_ETHERSCAN_TX_LINK,
  DIAMONDS_LINK,
} from 'constants/index';
import { displayBN, displayFullBN } from '../../util';
import { FormatTooltip } from '.';

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
  },
  lucidaStyle: {
    fontFamily: 'Lucida Console',
    fontSize: '11px',
  },
});

// function displayLP(balance) {
//   return `${displayBN(balance[0])} ${TokenLabel(CryptoAsset.Bean)}/${displayBN(balance[1])} ${TokenLabel(CryptoAsset.Ethereum)}`
// }

const BasicTable = (props) => {
  const classes = useStyles();

  const { rowsPerPage } = props;

  const titles = props.colTitles;
  let count = 0;

  return (
    <Box>
      <TableContainer>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow key="NFT List">
              {titles.map((t) => (
                <TableCell
                  key={t}
                  align="center"
                  style={{ fontFamily: 'Futura-PT', width: '33%' }}
                >
                  {t}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(props.crates)
              .slice(
                props.page * rowsPerPage,
                props.page * rowsPerPage + rowsPerPage
              )
              .map((index) => ( // eslint-disable-line
                <TableRow key={index}>
                  {props.indexType === 'time' ? (
                    <TableCell
                      align="center"
                      className={classes.lucidaStyle}
                      component="th"
                      scope="index"
                    >
                      {`${(count += 1)}`}
                    </TableCell>
                  ) : null}
                  <TableCell
                    align="center"
                    className={classes.lucidaStyle}
                    component="th"
                    scope="index"
                  >
                    {props.indexType === 'time'
                      ? props.crates[index].timeSinceSunrise
                      : props.crates[index].id}
                  </TableCell>
                  {props.crates[index].beans !== undefined ? (
                    <TableCell align="center" className={classes.lucidaStyle}>
                      <FormatTooltip
                        placement="right"
                        title={`${displayFullBN(
                          new BigNumber(props.crates[index].beans)
                        )} Beans`}
                      >
                        <span>
                          {displayBN(new BigNumber(props.crates[index].beans))}
                        </span>
                      </FormatTooltip>
                    </TableCell>
                  ) : null}
                  {props.crates[index].txn !== undefined &&
                  props.crates[index].txn.length > 2 ? (
                    <TableCell align="center" className={classes.lucidaStyle}>
                      <Link
                        href={`${BASE_ETHERSCAN_TX_LINK}${props.crates[index].txn}`}
                        color="inherit"
                        target="blank"
                      >
                        <span>
                          {`${props.crates[index].txn.substring(
                            0,
                            6
                          )}...${props.crates[index].txn.substring(
                            props.crates[index].txn.length - 4
                          )}`}
                        </span>
                      </Link>
                    </TableCell>
                  ) : props.crates[index].txn !== undefined ? (
                    <TableCell align="center" className={classes.lucidaStyle}>
                      <Link href={DIAMONDS_LINK} color="inherit" target="blank">
                        <span>{`${props.crates[index].txn}`}</span>
                      </Link>
                    </TableCell>
                  ) : null}
                  {props.crates[index].account !== undefined &&
                  props.assetType !== 'nft' ? (
                    <TableCell align="center" className={classes.lucidaStyle}>
                      <Link
                        href={`${BASE_ETHERSCAN_ADDR_LINK}${props.crates[index].account}`}
                        color="inherit"
                        target="blank"
                      >
                        <span>
                          {`${props.crates[index].account.substring(
                            0,
                            6
                          )}...${props.crates[index].account.substring(
                            props.crates[index].account.length - 4
                          )}`}
                        </span>
                      </Link>
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
          labelDisplayedRows={({ from, count: c }) =>
            `${Math.ceil(from / rowsPerPage)}-${
              c !== -1 ? Math.ceil(c / rowsPerPage) : 0
            }`
          }
        />
      ) : null}
    </Box>
  );
};

export default function NftListTable(props) {
  return (
    <Box style={props.style}>
      <BasicTable {...props} />
    </Box>
  );
}

NftListTable.defaultProps = {
  crates: {},
  index: 0,
  page: 0,
  resetPage: 0,
  rowsPerPage: 5,
};
