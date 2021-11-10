import React from 'react';
import { Box } from '@material-ui/core';
import { displayBN, displayFullBN, TokenLabel } from '../../util';
import { FormatTooltip, Grid, QuestionModule } from '../Common';

export default function ClaimBalance(props) {
  if (props.balance.isGreaterThan(0)) {
    return (
      <Grid container item xs={12} justifyContent="center">
        <Grid container item justifyContent="center">
          <Box style={{ position: 'relative' }}>
            <Box className="claimTextField-header">
              {`${props.asset !== undefined ? TokenLabel(props.asset) : props.title}`}
              <QuestionModule
                description={props.description}
                margin="-8px 0 0 -1px"
                widthTooltip={props.widthTooltip}
              />
            </Box>
          </Box>
          <Box>
            <FormatTooltip
              margin="0 0 6px 10px"
              placement="top-start"
              title={`${displayFullBN(props.balance)} ${props.asset !== undefined ? TokenLabel(props.asset) : props.title}`}
            >
              <Box className="claimTextField-content" style={{ margin: '0 0 0 5px' }}>
                {`${displayBN(props.balance)}`}
              </Box>
            </FormatTooltip>
          </Box>
        </Grid>
      </Grid>
    );
  }
}

ClaimBalance.defaultProps = {
  userClaimable: 0,
  title: 'undefined',
};
