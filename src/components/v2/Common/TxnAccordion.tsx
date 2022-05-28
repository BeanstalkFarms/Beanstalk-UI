import React from 'react';

import { Accordion, AccordionDetails } from '@mui/material';
import StyledAccordionSummary from './Accordion/AccordionSummary';

const TxnAccordion : React.FC = ({ children }) => (
  <Accordion defaultExpanded variant="outlined">
    <StyledAccordionSummary title="Transaction Details" />
    <AccordionDetails>
      {children}
    </AccordionDetails>
  </Accordion>
  );

export default TxnAccordion;
