import React from 'react';
import BigNumber from 'bignumber.js';
import {
  Box,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import {
  BASE_ETHERSCAN_ADDR_LINK,
  BASE_ETHERSCAN_TX_LINK,
  DIAMONDS_LINK,
} from 'constants/index';
import { displayBN, displayFullBN } from '../../util';
import { FormatTooltip } from './index';

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
            {Object.keys(props.nftList)
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
                      ? props.nftList[index].timeSinceSunrise
                      : props.nftList[index].id}
                  </TableCell>
                  {props.nftList[index].beans !== undefined ? (
                    <TableCell align="center" className={classes.lucidaStyle}>
                      <FormatTooltip
                        placement="right"
                        title={`${displayFullBN(
                          new BigNumber(props.nftList[index].beans)
                        )} Beans`}
                      >
                        <span>
                          {displayBN(new BigNumber(props.nftList[index].beans))}
                        </span>
                      </FormatTooltip>
                    </TableCell>
                  ) : null}
                  {props.nftList[index].txn !== undefined &&
                  props.nftList[index].txn.length > 2 ? (
                    <TableCell align="center" className={classes.lucidaStyle}>
                      <Link
                        href={`${BASE_ETHERSCAN_TX_LINK}${props.nftList[index].txn}`}
                        color="inherit"
                        target="blank"
                      >
                        <span>
                          {`${props.nftList[index].txn.substring(
                            0,
                            6
                          )}...${props.nftList[index].txn.substring(
                            props.nftList[index].txn.length - 4
                          )}`}
                        </span>
                      </Link>
                    </TableCell>
                  ) : props.nftList[index].txn !== undefined ? (
                    <TableCell align="center" className={classes.lucidaStyle}>
                      <Link href={DIAMONDS_LINK} color="inherit" target="blank">
                        <span>{`${props.nftList[index].txn}`}</span>
                      </Link>
                    </TableCell>
                  ) : null}
                  {props.nftList[index].account !== undefined &&
                  props.assetType !== 'nft' ? (
                    <TableCell align="center" className={classes.lucidaStyle}>
                      <Link
                        href={`${BASE_ETHERSCAN_ADDR_LINK}${props.nftList[index].account}`}
                        color="inherit"
                        target="blank"
                      >
                        <span>
                          {`${props.nftList[index].account.substring(
                            0,
                            6
                          )}...${props.nftList[index].account.substring(
                            props.nftList[index].account.length - 4
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
      {Object.keys(props.nftList).length > rowsPerPage ? (
        <TablePagination
          className={classes.pagination}
          component="div"
          count={Object.keys(props.nftList).length}
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
  nftList: {},
  index: 0,
  page: 0,
  resetPage: 0,
  rowsPerPage: 5,
};
