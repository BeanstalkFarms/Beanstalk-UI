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

export default function NftAccountsListTable({
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
                  <TableCell align="center" className={classes.lucidaStyle}>
                    <Link
                      href={`${BASE_ETHERSCAN_ADDR_LINK}${nftList[index].account}`}
                      color="inherit"
                      target="blank"
                    >
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
                  <TableCell align="center" className={classes.lucidaStyle}>
                    {nftList[index].nfts}
                  </TableCell>
                  <TableCell align="center" className={classes.lucidaStyle}>
                    <FormatTooltip
                      placement="right"
                      title={`${displayFullBN(
                        new BigNumber(nftList[index].investedBeans)
                      )} Beans`}
                    >
                      <span>
                        {displayBN(new BigNumber(nftList[index].investedBeans))}
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

NftAccountsListTable.defaultProps = {
  nftList: [],
  page: 0,
  rowsPerPage: 5,
};
