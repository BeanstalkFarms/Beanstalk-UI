import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionWrapper from '../Common/AccordionWrapper';

const NextSeason : React.FC = () => {
  return (
    <AccordionWrapper>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Accordion 1</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </AccordionWrapper>
  );
}

export default NextSeason;