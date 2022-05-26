import React from 'react';
import { Accordion, AccordionDetails, Stack, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import StyledAccordionSummary from 'components/v2/Common/Accordion/AccordionSummary';
import cucumberIcon from '../../../../img/cucumber.svg';
import AccordionWrapper from '../../Common/Accordion/AccordionWrapper';
import { ERC20Token, NativeToken } from '../../../../classes/Token';

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
  // amount: BigNumber;
  token: NativeToken | ERC20Token;
}

const TxnAccordion: React.FC<AccordionProps> =
  ({
    //  amount,
     token
   }:
     AccordionProps
  ) => {
    const classes = useStyles();
    return (
      <AccordionWrapper>
        <Accordion sx={{ background: 'none', borderColor: '#c7ddf0' }}>
          <StyledAccordionSummary title="Transaction Details" />
          <AccordionDetails>
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

export default TxnAccordion;
