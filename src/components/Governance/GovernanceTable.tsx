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
  bipsList,
  theme,
  GOVERNANCE_EMERGENCY_PERIOD,
  GOVERNANCE_EMERGENCY_THRESHOLD_DEMONINATOR,
  GOVERNANCE_EMERGENCY_THRESHOLD_NUMERATOR,
  GOVERNANCE_EXPIRATION,
} from '../../constants';
import { percentForStalk } from '../../util';
import { Line, QuestionModule } from '../Common';
import CircularProgressWithLabel from './CircularProgressWithLabel';

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
  cell: {
    fontFamily: 'Futura-PT',
  },
  cellTitle: {
    fontFamily: 'Futura-PT-Book',
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

function summaryBips(open, bip) {
  if (open) {
    const bipID = parseInt(bip[0], 10);
    if (bipsList.length > bipID) {
      if (Object.keys(bipsList).length > parseInt(bip[0], 10)) {
        return (
          <iframe
            src={bipsList[bipID].path}
            style={{ border: 'none' }}
            title={`BIP-${bipID}`}
            width="100%"
            height="460px"
          />
        );
      }
      return (
        <iframe
          src="/BIPs/bip-default.html"
          style={{ border: 'none' }}
          title="BIP-default"
          width="100%"
          height="30px"
        />
      );
    }
  }
}

const Row = (props) => {
  const { bip } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow id={`bip-${bip[0]}`}>
        <TableCell style={{ padding: '5px', borderColor: theme.accentColor }}>
          <IconButton
            id={`open-bip-${bip[0]}`}
            aria-label="expand row"
            onClick={() => setOpen(!open)}
            size="small"
          >
            {open ? (
              <KeyboardArrowUpIcon id={`bip-${bip[0]}-open`} />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </TableCell>
        {Object.values(bip).map((bipValue, bipIndex) => (
          <TableCell
            key={`bip_table_cell_${bipIndex}`} // eslint-disable-line
            align="center"
            component="th"
            scope="bip"
            style={{
              fontFamily: 'Futura-PT-Book',
              fontSize: '18px',
              borderColor: theme.accentColor,
            }}
          >
            {bipIndex === 3 ? (
              <CircularProgressWithLabel value={bipValue} />
            ) : (
              bipValue
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
            {summaryBips(open, bip)}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const BipTable = (props) => {
  const classes = useStyles();

  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const titles = ['BIP', 'Title', 'Status', '% Voted'];
  const tableBips = props.bips
    .reduce((bips, bip) => {
      const voteProportion = bip.roots.dividedBy(props.totalRoots);
      const bipID = bip.id;
      const tb = {
        BIP: bipID.toString(),
        title: bipsList.length > bipID ? bipsList[bipID].title : `BIP-${bipID}`,
      };
      if (bip.executed) {
        tb.status = 'Commited';
      } else if (
        bip.start
          .plus(bip.period)
          .plus(GOVERNANCE_EXPIRATION)
          .isLessThanOrEqualTo(props.season)
      ) {
        tb.status = 'Failed';
      } else if (bip.start.plus(bip.period).isLessThanOrEqualTo(props.season)) {
        tb.status = voteProportion.isGreaterThan(0.5) ? 'Commitable' : 'Failed';
      } else if (
        bip.timestamp
          .plus(GOVERNANCE_EMERGENCY_PERIOD)
          .isLessThanOrEqualTo(new Date().getTime() / 1000) &&
        voteProportion.isGreaterThanOrEqualTo(
          GOVERNANCE_EMERGENCY_THRESHOLD_NUMERATOR /
            GOVERNANCE_EMERGENCY_THRESHOLD_DEMONINATOR
        )
      ) {
        tb.status = 'Emergency Committable';
      } else {
        tb.status = `${bip.period.minus(
          props.season.minus(bip.start)
        )} Seasons Remaining`;
      }
      tb.voted = percentForStalk(
        bip.roots,
        bip.endTotalRoots.isGreaterThan(0)
          ? bip.endTotalRoots
          : props.totalRoots
      );
      bips.push([tb.BIP, tb.title, tb.status, tb.voted]);
      return bips;
    }, [])
    .reverse();

  if (tableBips !== undefined) {
    return (
      <AppBar className={classes.inputModule} position="static">
        <span className={classes.title}>
          BIPs
          <QuestionModule
            description="Below is a complete list of all historical BIPs."
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
              {tableBips
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((bip, index) => (
                  <Row key={`bip_row_${index}`} bip={bip} /> // eslint-disable-line
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        {Object.keys(tableBips).length > rowsPerPage ? (
          <TablePagination
            component="div"
            count={Object.keys(tableBips).length}
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
 * The description will be manually added by the bip proposer via merge request when a bip is submitted.
 *
 * To Submit a New BIP:
 * (1) Fill out template HTML from '/public/BIPs/BIP-template.html'
 * (2) Add a new bip path to the bipsList object in '/src/constants/bips.js'
 * (3) Submit a merge request on github: https://github.com/BeanstalkFarms/Beanstalk
 */

export default function GovernanceTable(props) {
  return (
    <Box style={props.style}>
      <BipTable {...props} />
    </Box>
  );
}
