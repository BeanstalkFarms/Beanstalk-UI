import React from 'react';
import { AccordionSummary, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import splitArrowsIcon from '~/img/interface/split-arrows.svg';
import { BeanstalkPalette, IconSize } from '../../App/muiTheme';
import IconWrapper from '../IconWrapper';
import Row from '~/components/Common/Row';

const StyledAccordionSummary : React.FC<{
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
          color: BeanstalkPalette.darkBlue,
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
          background: 'linear-gradient(90deg, rgba(70, 185, 85, 1.0) 0%, rgba(123, 97, 255, 1.0) 36.58%, rgba(31, 120, 180, 1.0) 96.2%)',
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
