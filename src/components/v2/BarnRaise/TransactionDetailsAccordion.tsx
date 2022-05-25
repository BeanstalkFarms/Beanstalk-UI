import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Divider, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { makeStyles } from '@mui/styles';
import { displayBN } from '../../../util';
import splitArrowsIcon from '../../../img/split-arrows.svg';
import cucumberIcon from '../../../img/cucumber.svg';
import AccordionWrapper from '../Common/AccordionWrapper';
import { ERC20Token, NativeToken } from '../../../classes/Token';

const useStyles = makeStyles(() => ({
  hr: {
    border: 'none',
    borderTop: '6px dotted #dddddd',
    color: '#fff',
    backgroundColor: '#fff',
    height: '1px',
    width: '100%'
  }
}));

export interface AccordionProps {
  amount: BigNumber;
  token: NativeToken | ERC20Token;
}

const TransactionDetailsAccordion: React.FC<AccordionProps> =
  ({
     amount,
     token
   }:
     AccordionProps
  ) => {
    const classes = useStyles();
    return (
      <AccordionWrapper>
        <Accordion
          sx={{ background: 'none', borderColor: '#c7ddf0' }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Stack direction="row" gap={1}>
              <img alt="" src={splitArrowsIcon} />
              <Typography
                sx={{
                  background: 'linear-gradient(90deg, rgba(70, 185, 85, 1.0) 0%, rgba(123, 97, 255, 1.0) 36.58%, rgba(31, 120, 180, 1.0) 96.2%)',
                  '-webkit-background-clip': 'text',
                  '-webkit-text-fill-color': 'transparent'
                }}
              >
                Transaction Details
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            {/*<Typography>{displayBN(amount)}</Typography>*/}
            <Stack gap={2}>
              <Stack
                sx={{ pl: 2, pr: 2 }}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
              >
                <img alt="" src={token.logo} width="20px" />
                <hr className={classes.hr} />
                <img alt="" src={cucumberIcon} width="20px" />
              </Stack>
              <Stack>
                <Typography sx={{ opacity: 0.7 }}>
                  Activate 10,000 unused fertilizer
                </Typography>
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </AccordionWrapper>
    );
  };

export default TransactionDetailsAccordion;
