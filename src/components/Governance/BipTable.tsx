import React, { Fragment, useState } from 'react';
import BigNumber from 'bignumber.js';
import {
  Button,
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
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import {
  bipsList,
  theme,
  GOVERNANCE_EMERGENCY_PERIOD,
  GOVERNANCE_EMERGENCY_THRESHOLD_DEMONINATOR,
  GOVERNANCE_EMERGENCY_THRESHOLD_NUMERATOR,
  GOVERNANCE_EXPIRATION,
} from 'constants/index';
import { percentForStalk, commit, emergencyCommit } from 'util/index';
import { BIP } from 'state/general/reducer';

import TransactionToast from 'components/Common/TransactionToast';
import {
  governanceStrings,
  Line,
  TablePageSelect,
  QuestionModule,
} from 'components/Common';
import MultiCard from 'components/Common/Cards/MultiCard';
import CircularProgressWithLabel from './CircularProgressWithLabel';

const useStyles = makeStyles({
  table: {
    margin: '9px',
    width: 'auto',
    backgroundColor: theme.module.background,
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
  commitFont: {
    fontFamily: 'Futura-PT-Book'
  },
  lineMargin: {
    margin: '10px 8px',
  },
  outerTableCell: {
    width: '10px',
    borderBottom: `2px solid ${theme.accentColor}`,
  },
  innerTableCell: {
    fontFamily: 'Futura-PT-Book',
    fontSize: '16px',
    borderBottom: `2px solid ${theme.accentColor}`,
  }
});

function summaryBips(open: boolean, bip: BIP) {
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
            height="490px"
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

const Row : React.FC<{ bip: BIP }> = ({ bip }) => {
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

type ParsedBip = {
  BIP: string;
  title: string;
  status: string | React.ReactElement;
  voted: any;
}

const BipTable : React.FC<{
  bips: BIP[],
  season: BigNumber,
  totalRoots: BigNumber,
}> = (props) => {
  const classes = useStyles();

  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const commitHandler = (e) => {
    const id = e.currentTarget.dataset.index;
    const bip = props.bips[id];

    const voteProportion = bip.roots.dividedBy(props.totalRoots);
    const emergencyCommitable = bip.timestamp
      .plus(GOVERNANCE_EMERGENCY_PERIOD)
      .isLessThanOrEqualTo(new Date().getTime() / 1000) &&
    voteProportion.isGreaterThanOrEqualTo(
      GOVERNANCE_EMERGENCY_THRESHOLD_NUMERATOR /
        GOVERNANCE_EMERGENCY_THRESHOLD_DEMONINATOR
    );

    if (emergencyCommitable) {
      // Toast
      const txToast = new TransactionToast({
        loading: 'Emergency Commiting BIP',
        success: 'BIP Emergency Committed'
      });

      // Execute
      emergencyCommit(
        id,
        (response) => {
          txToast.confirming(response);
        }
      )
      .then((value) => {
        txToast.success(value);
      })
      .catch((err) => {
        console.log(err);
        txToast.error(err);
      });
    } else {
      // Toast
      const txToast = new TransactionToast({
        loading: 'Commiting BIP',
        success: 'BIP Committed'
      });

      // Execute
      commit(
        id,
        (response) => {
          txToast.confirming(response);
        }
      )
      .then((value) => {
        txToast.success(value);
      })
      .catch((err) => {
        console.log(err);
        txToast.error(err);
      });
    }
  };

  function commitButton(id) {
    return (
      <>
        <Button
          className={classes.formButton}
          color="primary"
          onClick={commitHandler}
          data-index={id}
          variant="contained"
        >
          <Box>
            <span className={classes.commitFont}>
              Commit
            </span>
            <QuestionModule
              description="Anyone can commit a BIP if it either has greater than a 50% majority of Stalk Voting for at the end of the 168 Season Voting Period, or greater than a 2/3 majority of Stalk Voting for at any point 24 hours or more after it was proposed and before the end of the Voting Period."
              margin="-11px 7px 0 0"
              marginTooltip="0 0 -5px 20px"
              widthTooltip="150px"
            />
          </Box>
        </Button>
      </>
    );
  }

  const titles = ['BIP', 'Title', 'Status', '% Voted'];

  const parsedBips = props.bips
    .reduce((bips, bip) => {
      const voteProportion = bip.roots.dividedBy(props.totalRoots);
      const bipID = bip.id;
      const pb : ParsedBip = {
        BIP: bipID.toString(),
        title: bipsList.length > bipID ? bipsList[bipID].title : `BIP-${bipID}`,
        status: 'Unknown',
        voted: null,
      };

      //
      if (bip.executed) {
        pb.status = 'Commited';
      } else if (
        bip.start
          .plus(bip.period)
          .plus(GOVERNANCE_EXPIRATION)
          .isLessThanOrEqualTo(props.season)
      ) {
        pb.status = 'Failed';
      } else if (bip.start.plus(bip.period).isLessThan(props.season)) {
        pb.status = voteProportion.isGreaterThan(0.5) ? commitButton(bipID) : 'Failed';
      } else if (
        bip.timestamp
          .plus(GOVERNANCE_EMERGENCY_PERIOD)
          .isLessThanOrEqualTo(new Date().getTime() / 1000) &&
        voteProportion.isGreaterThanOrEqualTo(
          GOVERNANCE_EMERGENCY_THRESHOLD_NUMERATOR /
            GOVERNANCE_EMERGENCY_THRESHOLD_DEMONINATOR
        )
      ) {
        pb.status = commitButton(bipID);
      } else {
        pb.status = `${bip.period.minus(
          props.season.minus(bip.start).minus(1)
        )} Seasons Remaining`;
      }
      pb.voted = percentForStalk(
        bip.roots,
        bip.endTotalRoots.isGreaterThan(0)
          ? bip.endTotalRoots
          : props.totalRoots
      );
      bips.push([pb.BIP, pb.title, pb.status, pb.voted]);
      return bips;
    }, [])
    .reverse();

  //
  if (parsedBips !== undefined) {
    return (
      <MultiCard type="input">
        <span className={classes.title}>
          BIPs
          <QuestionModule
            description={governanceStrings.bips}
            margin="-12px 0 0 2px"
          />
        </span>
        <Line className={classes.lineMargin} />
        {/* BIP Table */}
        <TableContainer className={classes.table}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell
                  size="small"
                  className={classes.outerTableCell}
                />
                {titles.map((t) => (
                  <TableCell
                    key={t}
                    align="center"
                    size="small"
                    className={classes.innerTableCell}
                  >
                    {t}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {parsedBips
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((bip : ParsedBip, index: number) => (
                  <Row key={`bip_row_${index}`} bip={bip} /> // eslint-disable-line
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Pagination */}
        {Object.keys(parsedBips).length > rowsPerPage ? (
          <div className={classes.pagination}>
            <TablePagination
              component="div"
              count={Object.keys(parsedBips).length}
              className={classes.pagination}
              onPageChange={handleChangePage}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[]}
              labelDisplayedRows={({ from, count }) =>
                `${Math.ceil(from / rowsPerPage)}-${
                  count !== -1 ? Math.ceil(count / rowsPerPage) : 0
                }`
              }
              ActionsComponent={
                Object.keys(parsedBips).length > (rowsPerPage * 2)
                  ? TablePageSelect
                  : undefined
              }
            />
          </div>
        ) : null}
      </MultiCard>
    );
  }
  
  return null;
};

/**
 * The description will be manually added by the bip proposer via merge request when a bip is submitted.
 *
 * To Submit a New BIP:
 * (1) Fill out template HTML from '/public/BIPs/BIP-template.html'
 * (2) Add a new bip path to the bipsList object in '/src/constants/bips.js'
 * (3) Submit a merge request on github: https://github.com/BeanstalkFarms/Beanstalk
 */

export default BipTable;
