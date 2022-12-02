import React from 'react';
import { AccordionSummary, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import splitArrowsIcon from '~/img/beanstalk/interface/split-arrows.svg';
import { IconSize } from '../../App/muiTheme';
import IconWrapper from '../IconWrapper';
import Row from '~/components/Common/Row';

import { FC } from '~/types';

const StyledAccordionSummary : FC<{
  title: string | JSX.Element;
  icon?: JSX.Element;
  gradientText?: boolean;
}> = ({
  title,
  icon,
  gradientText = true,
}) => (
  <AccordionSummary
    expandIcon={(
      <ExpandMoreIcon
        sx={{
          color: 'primary.main',
          fontSize: IconSize.xs
        }}
      />
    )}>
    <Row>
      <IconWrapper boxSize={IconSize.medium}>
        {icon || <img alt="" src={splitArrowsIcon} height={IconSize.xs} />}
      </IconWrapper>
      <Typography
        variant="body1"
        sx={gradientText ? {
          background: 'linear-gradient(90deg, #00A6FB 0%, #1DB584 46.87%, #84B51D 96.2%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent'
        } : null}
      >
        {title}
      </Typography>
    </Row>
  </AccordionSummary>
);

export default StyledAccordionSummary;
