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
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {
  BASE_ETHERSCAN_ADDR_LINK,
  BASE_ETHERSCAN_TX_LINK,
} from 'constants/index';
import { displayBN, displayFullBN } from 'util/index';
import { FormatTooltip, TablePageSelect } from 'components/Common';

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
    fontSize: '10px',
    padding: '6px 6px',
  },
  cellStyle: {
    fontFamily: 'Futura-PT',
    padding: '6px 6px',
    width: (props: any) => `${100 / props.colTitles.length - 1}%`,
  }
});

export default function NftListTable({
  colTitles,
  handleChange,
  nftList,
  page,
  rowsPerPage,
  style,
}) {
  const props = {
    colTitles: colTitles
  };
  const classes = useStyles(props);

  let count = 0;

  return (
    <Box style={style}>
      <TableContainer>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow key="NFT List">
              {colTitles.map((t) => (
                <TableCell
                  key={t}
                  align="center"
                  className={classes.cellStyle}
                >
                  {t}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(nftList)
              .slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
              )
              // eslint-disable-next-line
              .map((index) => (
                <TableRow key={index}>
                  <TableCell
                    align="center"
                    className={classes.lucidaStyle}
                    component="th"
                    scope="index"
                  >
                    {`${(count += 1)}`}
                  </TableCell>
                  {nftList[index].account !== undefined ? (
                    <TableCell align="center" className={classes.lucidaStyle}>
                      <Link
                        href={`${BASE_ETHERSCAN_ADDR_LINK}${nftList[index].account}`}
                        color="inherit"
                        target="blank"
                        underline="hover">
                        <span>
                          {`${nftList[index].account.substring(
                            0,
                            6
                          )}...${nftList[index].account.substring(
                            nftList[index].account.length - 4
                          )}`}
                        </span>
                      </Link>
                    </TableCell>
                  ) : null}
                  <TableCell align="center" className={classes.lucidaStyle}>
                    <Link
                      href={`${BASE_ETHERSCAN_TX_LINK}${nftList[index].txn}`}
                      color="inherit"
                      target="blank"
                      underline="hover">
                      {nftList[index].type}
                    </Link>
                  </TableCell>
                  <TableCell align="center" className={classes.lucidaStyle}>
                    <FormatTooltip
                      placement="right"
                      title={`${displayFullBN(
                        new BigNumber(nftList[index].beans)
                      )} Beans`}
                    >
                      <span>
                        {displayBN(new BigNumber(nftList[index].beans))}
                      </span>
                    </FormatTooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      {Object.keys(nftList).length > rowsPerPage ? (
        <TablePagination
          className={classes.pagination}
          component="div"
          count={Object.keys(nftList).length}
          onPageChange={handleChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[]}
          labelDisplayedRows={({ from, count: c }) =>
            `${Math.ceil(from / rowsPerPage)}-${
              c !== -1 ? Math.ceil(c / rowsPerPage) : 0
            }`
          }
          ActionsComponent={TablePageSelect}
        />
      ) : null}
    </Box>
  );
}

NftListTable.defaultProps = {
  nftList: {},
  page: 0,
  rowsPerPage: 5,
};
