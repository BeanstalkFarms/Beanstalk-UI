import React from 'react';
import { AccordionSummary, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import splitArrowsIcon from '../../../../img/split-arrows.svg';

const StyledAccordionSummary : React.FC<{
  title: string | JSX.Element;
  icon?: JSX.Element;
  gradientText?: boolean;
}> = ({
  title,
  icon,
  gradientText = true,
}) => (
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Stack direction="row" gap={2} alignItems="center" sx={{ pr: 2 }}>
      {icon || <img alt="" src={splitArrowsIcon} />}
      <Typography
        variant="h4"
        sx={gradientText ? {
          background: 'linear-gradient(90deg, rgba(70, 185, 85, 1.0) 0%, rgba(123, 97, 255, 1.0) 36.58%, rgba(31, 120, 180, 1.0) 96.2%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent'
        } : null}
      >
        {title}
      </Typography>
    </Stack>
  </AccordionSummary>
);

export default StyledAccordionSummary;