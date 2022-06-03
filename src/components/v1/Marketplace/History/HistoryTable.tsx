import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import { BalanceTableCell, TablePageSelect } from 'components/Common';
import TokenIcon from 'components/Common/TokenIcon';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { MarketHistoryItem } from 'state/marketplace/reducer';
import { CryptoAsset, displayBN, FarmAsset } from 'util/index';
import { useStyles } from '../TableStyles';

export default function HistoryTable() {
  const classes = useStyles();
  const [page, setPage] = useState<number>(0);
  const { history } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );
  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );

  if (!history || history.length === 0) {
    return (
      <div>
        <h4>No transactions yet.</h4>
      </div>
    );
  }

  //
  const rowsPerPage = 10;
  const slicedItems = history
    .slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );

  return (
    <>
      <TableContainer>
        <Table className={width > 500 ? classes.table : classes.tableSmall} size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                Event
              </TableCell>
              <TableCell align="center">
                Pods
              </TableCell>
              <TableCell />
              <TableCell>
                Pod Line
              </TableCell>
              <TableCell align="right">
                Price
              </TableCell>
              <TableCell align="right">
                Beans
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {slicedItems.map((item: MarketHistoryItem) => {
              // VERIFY
              const placeInLine = (item.index).plus(item.start).minus(harvestableIndex);
              return (
                <TableRow key={item.index}>
                  <TableCell
                    className={classes.lucidaStyle}>
                    <a href={`https://etherscan.io/tx/${item.transactionHash}`} target="_blank" rel="noreferrer">
                      {item.type === 'PodListingFilled' ? 'Buy from Listing' : 'Sell to Order'}
                    </a>
                  </TableCell>
                  <BalanceTableCell
                    className={classes.lucidaStyle}
                    label="Pods"
                    balance={item.amount}
                    icon={<TokenIcon token={FarmAsset.Pods} />}
                  >
                    {displayBN(item.amount)}
                  </BalanceTableCell>
                  <TableCell
                    className={classes.cell}
                  >
                    @
                  </TableCell>
                  <BalanceTableCell
                    className={classes.lucidaStyle}
                    align="left"
                    title={placeInLine.gt(0) 
                      ? `${displayBN(placeInLine)} In Line`
                      : 'These Pods have harvested'
                    }
                  >
                    {placeInLine.gt(0) 
                      ? `${displayBN(placeInLine)}`
                      : 'Hvst.'
                    }
                  </BalanceTableCell>
                  <BalanceTableCell
                    className={classes.lucidaStyle}
                    label="Beans per Pod"
                    balance={item.pricePerPod}
                    icon={<TokenIcon token={CryptoAsset.Bean} />}
                  >
                    {item.pricePerPod.toFixed(3)}
                  </BalanceTableCell>
                  <BalanceTableCell
                    className={classes.lucidaStyle}
                    label="Filled Beans"
                    balance={item.filledBeans}
                    icon={<TokenIcon token={CryptoAsset.Bean} />}
                  >
                    {displayBN(item.filledBeans)}
                  </BalanceTableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {/* display page button if user has more Orders than rowsPerPage. */}
      {history.length > rowsPerPage
        ? (
          <TablePagination
            component="div"
            count={history.length}
            onPageChange={(event, p) => { setPage(p); }}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
            labelDisplayedRows={({ from, count }) =>
              `${Math.ceil(from / rowsPerPage)}-${
                count !== -1 ? Math.ceil(count / rowsPerPage) : 0
              }`
            }
            ActionsComponent={
              history.length > (rowsPerPage * 2)
                ? TablePageSelect
                : undefined
            }
          />
        )
        : null}
    </>
  );
}