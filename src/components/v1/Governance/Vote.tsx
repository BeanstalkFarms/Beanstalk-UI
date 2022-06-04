import React, { useState } from 'react';
import {
  AppBar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import CheckIcon from '@mui/icons-material/Check';

import { percentForStalk, megaVote } from 'util/index';
import { AppState } from 'state';
import { BIP } from 'state/general/reducer';
import TransactionToast from 'components/Common/TransactionToast';
import { Line, QuestionModule, governanceStrings, TransactionDetailsModule } from 'components/Common';

import CircularProgressWithLabel from './CircularProgressWithLabel';
import { useStyles } from './VoteStyles';

type VoteProps = {
  bips: (BIP['id'])[];
  seasonBips: BIP[];
  stalkBips: any[];
  votedBips: any[]; // FIXME: this might be a set?
  totalRoots: AppState['totalBalance']['totalRoots'];
  userRoots: AppState['userBalance']['rootsBalance'];
}

export default function Vote(props: VoteProps) {
  const classes = useStyles();

  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Active bips
  const displayBips = props.bips.reduce((dp, bipIdBn) => {
    const row : any[] = [];
    const bipId : number = bipIdBn;
    row.push(bipId);
    row.push(`${props.seasonBips[bipId]}`);
    const newStalk = props.votedBips[bipId]
      ? props.stalkBips[bipId].minus(props.userRoots)
      : props.stalkBips[bipId].plus(props.userRoots);
    const percentForNewStalk = percentForStalk(newStalk, props.totalRoots);
    const percentForPrevStalk = percentForStalk(
      props.stalkBips[bipId],
      props.totalRoots
    );
    row.push(props.votedBips[bipId]);
    row.push(
      <Box>
        <CircularProgressWithLabel
          lowvalue={Math.min(percentForNewStalk, percentForPrevStalk)}
          value={Math.max(percentForNewStalk, percentForPrevStalk)}
          voting={!props.votedBips[bipId]}
        />
      </Box>
    );
    dp.push(row);
    return dp;
  }, []);

  // Take the selected row indices and return the combined array
  const selectedBips = selected.reduce((dp, bip) => {
    dp.push(displayBips[bip]);
    return dp;
  }, []);

  // Take the selected row indecies and return the combined array
  const selectedDetails = selectedBips.reduce((dp, bip) => {
    if (bip[2] === false) {
      dp.push(`Vote for BIP-${bip[0]}`);
      return dp;
    }
    dp.push(`Unvote BIP-${bip[0]}`);
    return dp;
  }, []);

  // Handle select all
  const handleSelectAllClick = () => {
    if (!selectAll) {
      // take all active bips and return the index number
      setSelected(Object.keys(props.bips).map((i) => Number(i)));
      setSelectAll(!selectAll);
      return;
    }
    setSelected([]);
    setSelectAll(!selectAll);
  };

  // Selected Bips checkbox handler
  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    // Checkbox selected if number selected equals active bips
    if (newSelected.length === displayBips.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }

    setSelected(newSelected);
  };
  const isSelected = (s) => selected.indexOf(s) !== -1;

  const buttonHandler = () => {
    // Toast
    const _s = selectedBips.length > 1 ? 's' : '';
    const txToast = new TransactionToast({
      // Since we vote for m
      loading: `Casting vote${_s} for ${selectedBips.length} BIP${_s}`,
      success: `Vote${_s} cast for ${selectedBips.length} BIP${_s}`
      // loading: props.votedBips[props.bips[selected]] ? `Unvoting for BIP` : `Voting for BIP`,
      // success: props.votedBips[props.bips[selected]] ? `Vote removed!` : `Vote cast!`,
    });

    // Execute
    megaVote(
      selectedBips,
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
  };
  const voteTable = (
    <TableContainer className={classes.table}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell
              className={classes.cellTitle}
              size="small"
              align="center"
            >
              {props.bips.length > 1
                ? (
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAllClick}
                  />
                )
                : null}
            </TableCell>
            <TableCell
              className={classes.cellTitle}
              size="small"
              align="center"
            >
              BIP
            </TableCell>
            <TableCell
              className={classes.cellTitle}
              size="small"
              align="center"
            >
              Seasons Remaining
            </TableCell>
            <TableCell
              className={classes.cellTitle}
              size="small"
              align="center"
            >
              Voted
            </TableCell>
            <TableCell
              className={classes.cellTitle}
              size="small"
              align="center"
            >
              Vote %
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayBips.map((bip, index) => {
            const isItemSelected = isSelected(index);

            return (
              <TableRow
                key={`table_row_${index}`} // eslint-disable-line
                className={selected[index] === index ? classes.rowSelected : classes.pointerCursor}
                hover
                onClick={() => handleClick(bip, index)}
                selected={isItemSelected}
              >
                <TableCell
                  className={classes.cell}
                  align="center"
                  size="small"
                >
                  <Checkbox
                    checked={isItemSelected || selectAll}
                  />
                </TableCell>
                <TableCell
                  className={classes.cell}
                  size="small"
                  align="center"
                >
                  {bip[0]}
                </TableCell>
                <TableCell
                  className={classes.cell}
                  size="small"
                  align="center"
                >
                  {bip[1]}
                </TableCell>
                <TableCell
                  className={classes.cell}
                  size="small"
                  align="center"
                >
                  {bip[2] ? <CheckIcon /> : 'No'}
                </TableCell>
                <TableCell
                  className={classes.cell}
                  size="small"
                  align="center"
                >
                  {bip[3]}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  function transactionDetails() {
    if (props.userRoots.isLessThanOrEqualTo(0) || selected.length < 1) return null;

    return (
      <>
        <TransactionDetailsModule fields={selectedDetails} />
        <br />
      </>
    );
  }

  return (
    <AppBar className={classes.inputModule} position="static">
      <form autoComplete="off" noValidate>
        <span className={classes.title}>
          Active BIPs
          <QuestionModule
            description={governanceStrings.activeBips}
            margin="-6px 0 0 2px"
          />
        </span>
        <Line
          style={{
            margin: '10px 8px',
          }}
        />
        {voteTable}
        {transactionDetails()}
        <Button
          className={classes.formButton}
          color="primary"
          disabled={props.userRoots.isLessThanOrEqualTo(0) || selected.length < 1}
          onClick={buttonHandler}
          variant="contained"
        >
          {props.userRoots.isGreaterThan(0)
            ? `${
                props.votedBips[props.bips[selected]] ? 'Unvote' : 'Vote'
              }`
            : 'No Stalk'}
        </Button>
      </form>
    </AppBar>
  );
}
