import React, { Fragment, useState } from 'react';
import {
  AppBar,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableHead,
  TableRow,
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import {
  fundsList,
  theme,
} from 'constants/index';
import { Line, QuestionModule, fundraiserStrings } from 'components/Common';
import CircularProgressWithLabel from 'components/Governance/CircularProgressWithLabel';

const useStyles = makeStyles({
  table: {
    margin: '9px',
    width: 'auto',
  },
  pagination: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    display: 'inline-block',
    fontFamily: 'Futura-Pt-Book',
    fontSize: '20px',
    marginTop: '10px',
    textAlign: 'center',
    width: '100%',
  },
  inputModule: {
    backgroundColor: theme.module.background,
    borderRadius: '25px',
    color: theme.text,
    marginTop: '18px',
    maxWidth: '800px',
    padding: '10px 10px 20px 10px',
    marginBottom: '80px',
  },
});

function summaryFunds(open, fund) {
  if (open) {
    const fundID = parseInt(fund[0], 10);
    if (fundsList.length > fundID) {
      if (Object.keys(fundsList).length > fundID && fundsList[fundID].path !== undefined) {
        return (
          <iframe
            src={fundsList[fundID].path}
            style={{ border: 'none' }}
            title={`FUND-${fundID}`}
            width="100%"
            height="340px"
          />
        );
      }
      return (
        <iframe
          src="/Funds/fund-default.html"
          style={{ border: 'none' }}
          title="fund-default"
          width="100%"
          height="50px"
        />
      );
    }
  }
}

const Row = (props) => {
  const { fund } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow id={`fund-${fund[0]}`}>
        <TableCell style={{ padding: '5px', borderColor: theme.accentColor }}>
          <IconButton
            id={`open-fund-${fund[0]}`}
            aria-label="expand row"
            onClick={() => setOpen(!open)}
            size="small"
          >
            {open ? (
              <KeyboardArrowUpIcon id={`fund-${fund[0]}-open`} />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </TableCell>
        {Object.values(fund).map((fundValue, fundIndex) => (
          <TableCell
            key={`fund_table_cell_${fundIndex}`} // eslint-disable-line
            align="center"
            component="th"
            scope="fund"
            style={{
              fontFamily: 'Futura-PT-Book',
              fontSize: '18px',
              borderColor: theme.accentColor,
            }}
          >
            {fundIndex === 4 ? (
              <CircularProgressWithLabel value={fundValue} />
            ) : (
              fundValue
            )}
          </TableCell>
        ))}
      </TableRow>
      <TableRow>
        <TableCell
          colSpan={6}
          style={{
            fontFamily: 'Futura-Pt-Book',
            padding: '0px',
            borderColor: theme.accentColor,
          }}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            {summaryFunds(open, fund)}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const FundTable = (props) => {
  const classes = useStyles();

  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const titles = ['Fundraiser', 'Title', 'Type', 'Amount', 'Remaining'];
  const tableFunds = props.fundraisers
    .reduce((funds, fund) => {
      const fundID = fund.id;
      const fundAdds = props.fundraisersInfo[fundID];
      const tb = {
        FUND: fundID.toString(),
        title: fundAdds.name,
        type: fundAdds.type,
        amount: `${fund.total.toFixed()} ${fundAdds.token}`,
      };
      if (fund.remaining.isGreaterThan(0)) {
        tb.remaining = fund.remaining
          .dividedBy(fund.total)
          .multipliedBy(100)
          .decimalPlaces(2)
          .toNumber();
      } else {
        tb.remaining = fund.remaining;
      }

      funds.push([tb.FUND, tb.title, tb.type, tb.amount, tb.remaining]);
      return funds;
    }, [])
    .reverse();

  if (tableFunds !== undefined) {
    return (
      <AppBar className={classes.inputModule} position="static">
        <span className={classes.title}>
          Fundraisers
          <QuestionModule
            description={fundraiserStrings.fundsTableDescription}
            margin="-12px 0 0 2px"
          />
        </span>
        <Line
          style={{
            margin: '10px 8px',
          }}
        />
        <TableContainer className={classes.table}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell
                  size="small"
                  style={{
                    width: '10px',
                    borderBottom: `2px solid ${theme.accentColor}`,
                  }}
                />
                {titles.map((t) => (
                  <TableCell
                    key={t}
                    align="center"
                    size="small"
                    style={{
                      fontFamily: 'Futura-PT-Book',
                      fontSize: '16px',
                      borderBottom: `2px solid ${theme.accentColor}`,
                    }}
                  >
                    {t}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableFunds
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((fund, index) => (
                  <Row key={`fund_row_${index}`} fund={fund} /> // eslint-disable-line
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        {Object.keys(tableFunds).length > rowsPerPage ? (
          <TablePagination
            component="div"
            count={Object.keys(tableFunds).length}
            className={classes.pagination}
            onPageChange={handleChangePage}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
          />
        ) : null}
      </AppBar>
    );
  }
  return <></>;
};

/**
 * The description will be manually added by the bip proposer via merge request when a bip is submitted for a Fundraiser.
 *
 * To Submit a New Fundraiser:
 * (1) Fill out template HTML from '/public/Funds/Fund-template.html'
 * (2) Add a new fund path to the fundsList object in '/src/constants/funds.js'
 * (3) Submit a merge request on github: https://github.com/BeanstalkFarms/Beanstalk
 */

export default function FundraiserTable(props) {
  return (
    <Box style={props.style}>
      <FundTable {...props} />
    </Box>
  );
}
