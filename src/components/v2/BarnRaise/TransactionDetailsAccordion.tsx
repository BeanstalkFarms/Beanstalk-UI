import React, { useCallback } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Button, Card, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { displayBN } from '../../../util';
import splitArrowsIcon from '../../../img/split-arrows.svg';
import AccordionWrapper from '../Common/AccordionWrapper';

export interface AccordionProps {
  amount: BigNumber;
}

const TransactionDetailsAccordion: React.FC<AccordionProps> =
  ({
    amount
   }:
    AccordionProps
  ) => (
    <AccordionWrapper>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          >
          <Stack direction="row" gap={1}>
            <img alt="" src={splitArrowsIcon} />
            <Typography>Transaction Details</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{displayBN(amount)}</Typography>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </AccordionWrapper>
    );

export default TransactionDetailsAccordion;
